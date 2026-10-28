// Yerleşik "Otomasyonlar" kartı (type: ismet-automations): bütün otomasyonları listeler, tek dokunuşla açar/kapatır,
// "Durdur" ile bir süre kapatıp süre bitince kendiliğinden geri açar (süreyi entegrasyon tutar: src custom_components/ismet_home/snooze.py).
// Ayarlar (hepsi isteğe bağlı):
//   include: ["*giris*"]        yalnız bu kalıplara uyanlar (varlık kimliği ya da ad, * joker)
//   exclude: ["*test*"]         bunlar listelenmez
//   durations: [5, 10, 15, 20, 25, 30, 60, 180]    "Durdur" süreleri (dakika)
//   search: true                arama kutusu
//   related: light.giris        yalnız bu cihazı yöneten otomasyonlar (HA'nın "ilgili" bilgisinden); ışığa çift dokununca bu açılır
const LP_AUT_TXT = {
  tr: { search: 'Otomasyon ara', all: 'Hepsi', off: 'Kapalı', paused: 'Durdurulan', pause: 'Durdur', resume: 'Şimdi aç', never: 'Hiç çalışmadı', ago: '{t} önce', left: '{t} sonra açılır', disabled: 'Kapalı',
    none: 'Otomasyon yok', noneRel: 'Bu cihazı yöneten otomasyon bulunamadı', loading: 'Yükleniyor…', popTitle: 'Otomasyonlar', fail: 'Olmadı: {e}', min: 'dk', hr: 'sa', day: 'gün', opening: 'Açılıyor…', count: '{n} otomasyon', pickT: 'Ne kadar durdurulsun?' },
  en: { search: 'Search automations', all: 'All', off: 'Off', paused: 'Paused', pause: 'Pause', resume: 'Turn on now', never: 'Never ran', ago: '{t} ago', left: 'back on in {t}', disabled: 'Off',
    none: 'No automations', noneRel: 'No automation controls this device', loading: 'Loading…', popTitle: 'Automations', fail: 'Failed: {e}', min: 'min', hr: 'h', day: 'd', opening: 'Turning on…', count: '{n} automations', pickT: 'Pause for how long?' }
};
const lpAutT = (lang, k, v) => { let s = (LP_AUT_TXT[lang] || LP_AUT_TXT.en)[k] || k; if (v) Object.keys(v).forEach((x) => { s = s.split('{' + x + '}').join(v[x]); }); return s; };
const lpAutRx = (pat) => new RegExp('^' + String(pat).toLowerCase().replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$');
// kalan süre: 1 sa 05 dk / 12:34 (dakika:saniye)
function lpAutLeft(sec) {
  sec = Math.max(0, Math.round(sec));
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60, p = (n) => (n < 10 ? '0' : '') + n;
  return h > 0 ? h + ':' + p(m) + ':' + p(s) : p(m) + ':' + p(s);
}
function lpAutAgo(lang, iso) {
  const t = iso ? Date.parse(iso) : NaN;
  if (isNaN(t)) return lpAutT(lang, 'never');
  const m = Math.max(0, Math.round((Date.now() - t) / 60000));
  const x = m < 1 ? '<1 ' + lpAutT(lang, 'min') : m < 60 ? m + ' ' + lpAutT(lang, 'min') : m < 1440 ? Math.round(m / 60) + ' ' + lpAutT(lang, 'hr') : Math.round(m / 1440) + ' ' + lpAutT(lang, 'day');
  return lpAutT(lang, 'ago', { t: x });
}

// ---- bir cihazı yöneten otomasyonlar (HA: search/related) ve çift dokunma ----
// Sonuç bellekte tutulur (15 dk). Çift dokunma yalnız otomasyonu olan cihazlarda açıktır; tek dokunuş yalnız bunlarda kısa gecikir.
const LP_REL = window.__ISMET_HOME_REL || (window.__ISMET_HOME_REL = { m: {}, p: {}, q: [], run: false });
const LP_REL_TTL = 15 * 60 * 1000, LP_DBL_MS = 280;
const lpDblOn = () => lpSettings().dbl_auto !== false;
const lpRelHas = (id) => { const r = LP_REL.m[id]; return !!(r && r.a.length); };
function lpRelResolve(h, vals) {
  const S = h.states || {}, out = [];
  (vals || []).forEach((v) => {
    let id = typeof v === 'string' && v.indexOf('automation.') === 0 && S[v] ? v : null;
    if (!id && typeof v === 'string') id = Object.keys(S).filter((k) => k.indexOf('automation.') === 0 && S[k].attributes && S[k].attributes.id === v)[0] || null;   // yapılandırma kimliği geldiyse
    if (id && out.indexOf(id) < 0) out.push(id);
  });
  return out;
}
function lpRelated(h, id) {
  const c = LP_REL.m[id];
  if (c && Date.now() - c.t < LP_REL_TTL) return Promise.resolve(c.a);
  if (LP_REL.p[id]) return LP_REL.p[id];
  const done = (a) => { LP_REL.m[id] = { t: Date.now(), a: a }; delete LP_REL.p[id]; return a; };
  LP_REL.p[id] = Promise.resolve().then(() => h.callWS({ type: 'search/related', item_type: 'entity', item_id: id }))
    .then((r) => done(lpRelResolve(h, r && r.automation)), () => done([]));   // alınamazsa (izin yok, eski HA) o cihazda çift dokunma kapalı kalır
  return LP_REL.p[id];
}
function lpRelPrefetch(h, ids) {
  ids.forEach((id) => { const c = LP_REL.m[id]; if ((!c || Date.now() - c.t >= LP_REL_TTL) && !LP_REL.p[id] && LP_REL.q.indexOf(id) < 0) LP_REL.q.push(id); });
  if (LP_REL.run) return;
  LP_REL.run = true;
  const next = () => {
    const id = LP_REL.q.shift();
    if (!id) { LP_REL.run = false; return; }
    lpRelated(h, id).then(() => setTimeout(next, 120), () => setTimeout(next, 120));
  };
  next();
}
// tap: tek dokunuş, dbl: çift dokunuş, can(): çift dokunma bu cihazda açık mı. Kapalıysa tek dokunuş hemen çalışır.
function lpDblTap(tap, dbl, can) {
  let t = null;
  return () => {
    if (t) { clearTimeout(t); t = null; dbl(); return; }
    if (!can()) { tap(); return; }
    t = setTimeout(() => { t = null; tap(); }, LP_DBL_MS);
  };
}
function lpAutoPop(h, id, name, lang) {
  IsmetCardPopup.open(h, { title: (name || id) + ' · ' + lpAutT(lang, 'popTitle'), card: { type: 'ismet-automations', related: id, search: false } }, lang);
}
class IsmetAutomations extends HTMLElement {
  constructor() { super(); this._rel = null; this._cfg = {}; this._lang = 'tr'; this._q = ''; this._f = 'all'; this._open = null; this._key = null; this._built = false; this._busy = {}; }
  static getStubConfig() { return { type: 'custom:ismet-automations' }; }
  setConfig(cfg, lang) { this._cfg = cfg || {}; this._lang = lang || this._lang; this._key = null; this._rel = null; if (this._hass) this._load(); }
  _load() { if (this._cfg.related && this._hass) lpRelated(this._hass, this._cfg.related).then((a) => { this._rel = a; this._key = null; this._draw(); }); this._draw(); }
  set hass(h) {
    const first = !this._hass; this._hass = h;
    if (first && typeof STORE !== 'undefined' && !STORE.data) STORE.load(h).then(() => { this._key = null; this._draw(); }).catch(() => {});
    if (first && this._cfg.related) this._load(); else this._draw();
  }
  connectedCallback() {
    if (typeof STORE !== 'undefined') this._unsub = STORE.onChange(() => { this._key = null; this._draw(); });
    this._tm = setInterval(() => this._tick(), 1000);
  }
  disconnectedCallback() { if (this._unsub) { this._unsub(); this._unsub = null; } clearInterval(this._tm); this._tm = null; }
  _snoozes() { return (typeof STORE !== 'undefined' && STORE.data && STORE.data.snoozes) || {}; }
  _durs() { const d = Array.isArray(this._cfg.durations) ? this._cfg.durations.map(Number).filter((x) => x > 0 && x <= 2880) : []; return d.length ? d : [5, 10, 15, 20, 25, 30, 60, 180]; }
  _durLabel(m) { return m % 60 === 0 && m >= 60 ? (m / 60) + ' ' + lpAutT(this._lang, 'hr') : m + ' ' + lpAutT(this._lang, 'min'); }
  _list() {
    const S = (this._hass && this._hass.states) || {}, sn = this._snoozes();
    const inc = (Array.isArray(this._cfg.include) ? this._cfg.include : []).map(lpAutRx), exc = (Array.isArray(this._cfg.exclude) ? this._cfg.exclude : []).map(lpAutRx);
    const q = this._q.trim().toLowerCase(), out = [];
    Object.keys(S).forEach((id) => {
      if (id.indexOf('automation.') !== 0) return;
      if (this._cfg.related && (!this._rel || this._rel.indexOf(id) < 0)) return;
      const st = S[id], name = (st.attributes && st.attributes.friendly_name) || id, low = name.toLowerCase();
      if (inc.length && !inc.some((r) => r.test(id.toLowerCase()) || r.test(low))) return;
      if (exc.some((r) => r.test(id.toLowerCase()) || r.test(low))) return;
      const until = sn[id] ? Date.parse(sn[id]) : NaN, paused = !isNaN(until) && st.state === 'off';
      const off = st.state === 'off';
      if (this._f === 'off' && !off) return;
      if (this._f === 'paused' && !paused) return;
      if (q && low.indexOf(q) < 0 && id.toLowerCase().indexOf(q) < 0) return;
      out.push({ id, name, st, off, paused, until: paused ? until : 0, last: st.attributes && st.attributes.last_triggered, na: st.state === 'unavailable' });
    });
    out.sort((a, b) => (a.paused === b.paused ? String(a.name).localeCompare(String(b.name), 'tr') : a.paused ? -1 : 1));
    return out;
  }
  _build() {
    const T = (k) => esc(lpAutT(this._lang, k));
    this.innerHTML = '<style>' +
      'ismet-automations{display:block;width:100%;max-width:100%;min-width:0;overflow:hidden;contain:inline-size}' +
      '.au{display:flex;flex-direction:column;gap:8px;font-family:inherit;color:#ECEDEF;width:100%;min-width:0;box-sizing:border-box}' +
      '.au [data-id],.au .au-l{min-width:0;max-width:100%}' +
      '.au .bar{display:flex;gap:8px;flex-wrap:wrap;align-items:center}' +
      '.au input{flex:1 1 100%;min-width:0;height:44px;box-sizing:border-box;padding:0 14px;border-radius:14px;border:1px solid transparent;background:#1E2024;color:inherit;font:inherit;font-size:15px;outline:none}' +
      '.au input:focus{border-color:#F0A93B}' +
      '.au .ch{flex:1 1 0;justify-content:center;height:44px;padding:0 8px;border-radius:14px;background:#1E2024;display:flex;align-items:center;font-size:14px;font-weight:600;cursor:pointer;user-select:none;color:#9aa0a8}' +
      '.au .ch.on{background:#F0A93B;color:#111}' +
      '.au .cnt{font-size:12px;color:#9aa0a8;padding:0 4px}' +
      '.au .r{display:flex;align-items:center;gap:10px;min-height:56px;padding:6px 10px 6px 12px;border-radius:16px;background:#1E2024;min-width:0;box-sizing:border-box}' +
      '.au .r.sn{outline:2px solid #F0A93B;outline-offset:-2px}' +
      '.au .r .i{flex:none;width:28px;height:28px;display:grid;place-items:center}.au .r .i .lic{width:26px;height:26px}.au .r .i svg{width:100%;height:100%}' +
      '.au .r.off .i{opacity:.45}' +
      '.au .nm{flex:1;min-width:0}.au .nm b{display:block;font-size:15px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
      '.au .nm span{display:block;font-size:12px;color:#9aa0a8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
      '.au .r.sn .nm span{color:#F0A93B;font-weight:600;font-variant-numeric:tabular-nums}' +
      '.au .bt{flex:none;height:38px;padding:0 12px;border-radius:12px;background:#2A2D33;font-size:13px;font-weight:600;display:flex;align-items:center;cursor:pointer;user-select:none}' +
      '.au .bt.pri{background:#F0A93B;color:#111}' +
      '.au .t{flex:none;width:44px;height:26px;border-radius:13px;background:#3a3d44;position:relative;cursor:pointer}' +
      '.au .t::after{content:"";position:absolute;left:3px;top:3px;width:20px;height:20px;border-radius:50%;background:#111;transition:left .15s}' +
      '.au .t.on{background:#F0A93B}.au .t.on::after{left:21px}' +
      '.au .pk{display:flex;gap:8px;align-items:center;padding:4px 4px 6px 12px;flex-wrap:wrap}' +
      '.au .pk i{font-style:normal;font-size:12px;color:#9aa0a8;flex:1 1 100%}' +
      '.au .pk .bt{flex:1 1 72px;justify-content:center;height:46px;font-size:15px}' +
      '.au .none,.au .err{padding:14px;text-align:center;color:#9aa0a8;font-size:14px}.au .err{color:#FF9592}' +
      '.au .r:active,.au .bt:active,.au .ch:active{transform:scale(.98)}' +
      '</style><div class="au"><div class="bar">' +
      (this._cfg.search === false ? '' : '<input data-q type="search" placeholder="' + T('search') + '" autocomplete="off" spellcheck="false">') +
      '<div class="ch on" data-f="all">' + T('all') + '</div><div class="ch" data-f="off">' + T('off') + '</div><div class="ch" data-f="paused">' + T('paused') + '</div></div>' +
      '<div class="cnt" data-cnt></div><div data-list class="au-l" style="display:flex;flex-direction:column;gap:8px"></div></div>';
    const q = this.querySelector('[data-q]');
    if (q) q.addEventListener('input', () => { this._q = q.value; this._key = null; this._draw(); });
    this.addEventListener('click', (e) => this._click(e));
    this._built = true;
  }
  _call(promise) {
    return promise.catch((e) => {
      this._err = lpAutT(this._lang, 'fail', { e: (e && (e.message || e.code)) || '' });
      this._key = null; this._draw();
      clearTimeout(this._errTm); this._errTm = setTimeout(() => { this._err = ''; this._key = null; this._draw(); }, 5000);
    });
  }
  _click(e) {
    const h = this._hass; if (!h) return;
    const el = (s) => e.target.closest && e.target.closest(s);
    const f = el('[data-f]');
    if (f) { this._f = f.getAttribute('data-f'); this._open = null; this._key = null; this._draw(); return; }
    const row = el('[data-id]'); if (!row) return;
    const id = row.getAttribute('data-id'), st = h.states[id];
    if (!st) return;
    const pz = (m) => this._call(h.callWS({ type: 'ismet_home/snooze', entity_id: id, minutes: m }));
    if (el('[data-resume]')) { pz(0); return; }
    if (el('[data-pz]')) { this._open = this._open === id ? null : id; this._key = null; this._draw(); return; }
    const d = el('[data-dur]');
    if (d) { this._open = null; this._key = null; this._draw(); pz(+d.getAttribute('data-dur')); return; }
    if (el('[data-tg]')) {
      const sn = this._snoozes()[id];
      if (sn && st.state === 'off') { pz(0); return; }   // durdurulmuşu açmak = durdurmayı bitirmek
      this._call(h.callService('automation', st.state === 'on' ? 'turn_off' : 'turn_on', { entity_id: id }));
    }
  }
  _draw() {
    const h = this._hass; if (!h) return;
    if (!this._built) this._build();
    const L = this._list(), lang = this._lang;
    const key = [this._f, this._open, this._err || '', L.map((x) => x.id + '|' + x.name + '|' + x.st.state + '|' + x.until + '|' + (x.last || '')).join(',')].join('#');
    if (key === this._key) return;
    this._key = key;
    this.querySelectorAll('[data-f]').forEach((c) => c.classList.toggle('on', c.getAttribute('data-f') === this._f));
    const cnt = this.querySelector('[data-cnt]'); if (cnt) cnt.textContent = lpAutT(lang, 'count', { n: L.length });
    const durs = this._durs();
    const rowHtml = (x) => {
      const sub = x.paused ? '<span data-until="' + x.until + '"></span>' : '<span>' + esc(x.off ? lpAutT(lang, 'disabled') + ' · ' + lpAutAgo(lang, x.last) : lpAutAgo(lang, x.last)) + '</span>';
      const btn = x.na ? '' : x.paused ? '<div class="bt pri" data-resume>' + esc(lpAutT(lang, 'resume')) + '</div>' : (x.off ? '' : '<div class="bt" data-pz>' + esc(lpAutT(lang, 'pause')) + '</div>');
      const pick = this._open === x.id ? '<div class="pk"><i>' + esc(lpAutT(lang, 'pickT')) + '</i>' + durs.map((m) => '<div class="bt pri" data-dur="' + m + '">' + esc(this._durLabel(m)) + '</div>').join('') + '</div>' : '';
      return '<div data-id="' + esc(x.id) + '"><div class="r' + (x.off ? ' off' : '') + (x.paused ? ' sn' : '') + '"><span class="i">' + lpIcon(x.paused ? 'mdi:timer-outline' : x.off ? 'mdi:robot-off' : 'mdi:robot') + '</span><div class="nm"><b>' + esc(x.name) + '</b>' + sub + '</div>' + btn +
        (x.na ? '' : '<span class="t' + (x.st.state === 'on' ? ' on' : '') + '" data-tg></span>') + '</div>' + pick + '</div>';
    };
    this.querySelector('[data-list]').innerHTML = (this._err ? '<div class="err">' + esc(this._err) + '</div>' : '') + (L.length ? L.map(rowHtml).join('') : '<div class="none">' + esc(lpAutT(lang, this._cfg.related ? (this._rel ? 'noneRel' : 'loading') : 'none')) + '</div>');
    this._tick();
  }
  _tick() {
    const n = this.querySelectorAll ? this.querySelectorAll('[data-until]') : [];
    n.forEach((s) => {
      const left = (+s.getAttribute('data-until') - Date.now()) / 1000;
      s.textContent = left > 0 ? lpAutT(this._lang, 'left', { t: lpAutLeft(left) }) : lpAutT(this._lang, 'opening');
    });
  }
}
if (!customElements.get('ismet-automations')) customElements.define('ismet-automations', IsmetAutomations);
