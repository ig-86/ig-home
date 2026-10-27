"""Pause an automation for a while and turn it back on by itself (the "snooze").

The end time is saved with the panel data, so a restart of Home Assistant does not lose it. Three things bring the
automation back: a timer for the exact moment, the minute tick (a safety net if a timer was lost), and the start of
Home Assistant (a snooze that ended while it was off). If the automation is switched on by hand during a snooze, the
snooze is simply dropped.
"""
from __future__ import annotations

import logging
from datetime import timedelta
from typing import TYPE_CHECKING, Any

from homeassistant.core import Context, HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_send
from homeassistant.helpers.event import async_track_point_in_time
from homeassistant.util import dt as dt_util

from .const import SIGNAL_UPDATE

if TYPE_CHECKING:
    from . import PanelData

_LOGGER = logging.getLogger(__name__)
MAX_MINUTES = 2880   # two days


class Snoozer:
    def __init__(self, pd: "PanelData") -> None:
        self.pd = pd
        self.hass: HomeAssistant = pd.hass
        self._timers: dict[str, Any] = {}

    # ---- stored end times: {automation entity id: ISO time} ----
    def all(self) -> dict[str, str]:
        raw = self.pd.data.get("snoozes")
        if not isinstance(raw, dict):
            return {}
        return {k: v for k, v in raw.items() if isinstance(k, str) and k.startswith("automation.") and self._parse(v) is not None}

    @staticmethod
    def _parse(value: Any):
        return dt_util.parse_datetime(value) if isinstance(value, str) else None

    def _put(self, snoozes: dict[str, str]) -> None:
        self.pd.data["snoozes"] = snoozes
        self.pd.store.async_delay_save(lambda: self.pd.data, 1.0)
        async_dispatcher_send(self.hass, SIGNAL_UPDATE, {"__snooze": dict(snoozes)})

    # ---- timers ----
    def _unschedule(self, eid: str) -> None:
        stop = self._timers.pop(eid, None)
        if stop is not None:
            stop()

    def _schedule(self, eid: str, until) -> None:
        self._unschedule(eid)

        @callback
        def _fire(_now) -> None:
            self._timers.pop(eid, None)
            self.hass.async_create_task(self._expire(eid))

        self._timers[eid] = async_track_point_in_time(self.hass, _fire, until)

    def stop(self) -> None:
        for eid in list(self._timers):
            self._unschedule(eid)

    # ---- actions ----
    async def snooze(self, eid: str, minutes: int, context: Context | None = None) -> None:
        """Pause for `minutes` (0 = bring it back now). ValueError: not an automation we can pause."""
        if not isinstance(eid, str) or not eid.startswith("automation."):
            raise ValueError("Only automations can be paused")
        if minutes <= 0:
            await self.cancel(eid, context)
            return
        minutes = min(int(minutes), MAX_MINUTES)
        st = self.hass.states.get(eid)
        snoozes = self.all()
        if st is None or st.state in ("unavailable", "unknown"):
            raise ValueError("Automation not available")
        if st.state != "on" and eid not in snoozes:
            raise ValueError("Automation is already off")   # it would be switched on later: not what the person asked for
        until = dt_util.now() + timedelta(minutes=minutes)
        if st.state == "on":
            await self.hass.services.async_call("automation", "turn_off", {"entity_id": eid}, blocking=True, context=context)
        snoozes[eid] = until.isoformat()
        self._schedule(eid, until)
        self._put(snoozes)

    async def cancel(self, eid: str, context: Context | None = None) -> None:
        snoozes = self.all()
        self._unschedule(eid)
        if eid in snoozes:
            del snoozes[eid]
            self._put(snoozes)
        await self._turn_on(eid, context)

    async def _turn_on(self, eid: str, context: Context | None = None) -> None:
        st = self.hass.states.get(eid)
        if st is None or st.state == "on":
            return
        try:
            await self.hass.services.async_call("automation", "turn_on", {"entity_id": eid}, blocking=True, context=context)
        except Exception as err:  # noqa: BLE001 - a deleted automation must not break the others
            _LOGGER.warning("Could not turn %s back on: %s", eid, err)

    async def _expire(self, eid: str) -> None:
        snoozes = self.all()
        until = self._parse(snoozes.get(eid))
        if until is None or until > dt_util.now() + timedelta(seconds=2):
            return   # cancelled or extended in the meantime
        del snoozes[eid]
        self._put(snoozes)
        await self._turn_on(eid)

    # ---- startup and the minute tick ----
    async def start(self, *_args) -> None:
        """Home Assistant has started: schedule the open snoozes, finish those that ended while it was off."""
        now = dt_util.now()
        for eid, value in self.all().items():
            until = self._parse(value)
            if until is not None and until > now:
                self._schedule(eid, until)
            else:
                await self._expire(eid)

    async def check(self) -> None:
        now = dt_util.now()
        for eid, value in self.all().items():
            until = self._parse(value)
            st = self.hass.states.get(eid)
            if until is None or until <= now:
                await self._expire(eid)
            elif st is not None and st.state == "on":   # switched on by hand: nothing to bring back
                snoozes = self.all()
                snoozes.pop(eid, None)
                self._unschedule(eid)
                self._put(snoozes)
            elif eid not in self._timers:
                self._schedule(eid, until)
