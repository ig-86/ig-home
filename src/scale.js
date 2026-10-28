// Kanvas ölçekleme ve kiosk. İçerik ÖLÇÜLMEZ; zoom sadece ekran boyutundan hesaplanır ve hui-root'a CSS kuralı olarak yazılır.
// Böylece görünüm ilk karede doğru boyutta gelir, sayfa değişince oynamaz. (Arkadaşın panosundaki tablet-olcek.js v8'in dersi.)
// Kiosk: ayarda seçildiyse bizim panomuz açıkken HA'nın üst barı ve yan menüsü gizlenir (kiosk-mode ya da browser_mod gerekmez).
// Telefon düzeni (ölçekleme yok, bölümler alt alta, sayfa kayar): dar ekran (700 px altı), yatay telefon (yükseklik 500 px altı)
// ve dikey tutulan tablet (genişlik 1100 px altı, yükseklik genişlikten fazla). Yoksa 1280 px kanvas ekrana sığdırılır;
// yatay telefonda yazılar okunamayacak kadar küçülüyor, dikey tablette karolar uzun ince oluyordu.
function lpPhoneScreen() {
  const w = window.innerWidth || 1280, h = window.innerHeight || 800;
  return w < 700 || (h < 500 && w < 1100) || (h > w && w < 1100);
}
const IsmetScale = (() => {
  const ID = 'ismet-home-scale', KID = 'ismet-home-kiosk';
  function mainRoot() {
    try { return document.querySelector('home-assistant').shadowRoot.querySelector('home-assistant-main').shadowRoot; } catch (e) { return null; }
  }
  function root(m) {
    try {
      const p = m.querySelector('ha-panel-lovelace');
      const r = p && p.shadowRoot && p.shadowRoot.querySelector('hui-root');
      return (r && r.shadowRoot) ? r : null;
    } catch (e) { return null; }
  }
  function style(host, id, css) {
    if (!host) return;
    let st = host.getElementById ? host.getElementById(id) : host.querySelector('#' + id);
    if (!css) { if (st) st.textContent = ''; return; }
    if (!st) { st = document.createElement('style'); st.id = id; host.appendChild(st); }
    if (st.textContent !== css) st.textContent = css;
  }
  // yönetici için kiosk düğmesi: yan menüyü ve üst barı geçici olarak açıp kapatır (bu sekmede; sayfa yenilenince ayara döner)
  let show = false;
  try { show = sessionStorage.getItem('ismet_kiosk_show') === '1'; } catch (e) {}
  function btn(want) {
    let b = document.getElementById('ismet-kiosk-btn');
    if (!want) { if (b) b.remove(); return; }
    if (!b) {
      b = document.createElement('button'); b.id = 'ismet-kiosk-btn'; b.type = 'button';
      b.setAttribute('aria-label', 'HA menü / üst bar');
      b.style.cssText = 'position:fixed;left:8px;bottom:8px;z-index:9999;width:38px;height:38px;border-radius:50%;border:1px solid rgba(255,255,255,.25);background:rgba(20,20,26,.75);color:#fff;display:flex;align-items:center;justify-content:center;opacity:.4;cursor:pointer;padding:0;-webkit-tap-highlight-color:transparent';
      b.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z"/></svg>';
      b.addEventListener('click', () => { show = !show; try { sessionStorage.setItem('ismet_kiosk_show', show ? '1' : '0'); } catch (e) {} run(); setTimeout(run, 120); try { window.dispatchEvent(new Event('resize')); } catch (e) {} });
      document.body.appendChild(b);
    }
    b.style.opacity = show ? '.85' : '.4';
    // telefonda altta alt çubuk var: düğme onun üstünde durur
    b.style.bottom = lpPhoneScreen() ? '84px' : '8px';
  }
  function apply(canvas, kiosk) {
    const m = mainRoot(); if (!m) return;
    const r = root(m);
    const sr = r && r.shadowRoot;
    const raw = r && r.lovelace && r.lovelace.rawConfig;
    const active = !!sr && (!!sr.querySelector('ismet-home-card') || !!(raw && raw.strategy && raw.strategy.type === 'custom:ismet-home'));
    // kiosk: yan menü home-assistant-main içinde, üst bar hui-root içinde. Yeni HA (2025.x+) menü genişliğini
    // --ha-sidebar-width ile verir; sadece menüyü gizlemek solda boş şerit bırakıyordu, genişlik de sıfırlanır.
    const k = kiosk || {};
    const hideSide = !!k.hide_sidebar && !show, hideHead = !!k.hide_header && !show;
    btn(active && admin && !!(k.hide_sidebar || k.hide_header));
    style(m, KID, active && hideSide ? ':host{--ha-sidebar-width:0px !important;--ha-top-app-bar-width:100% !important}ha-sidebar{display:none !important}ha-drawer{--mdc-drawer-width:0px !important}' : '');
    if (!sr) return;
    style(sr, KID, active && hideHead ? '.header,.toolbar,app-header,ha-app-layout>[slot=header]{display:none !important}#view,hui-view-container{padding-top:0 !important;min-height:100vh !important}' : '');
    if (!active) { style(sr, ID, ''); return; }
    // telefon: ölçekleme yok, pano kendi telefon düzenini çizer (panel-card lpIsPhone ile aynı eşik)
    if (lpPhoneScreen()) { style(sr, ID, 'hui-view{min-height:0 !important;}'); return; }
    const W = (canvas && canvas.width) || 1280, H = (canvas && canvas.ref_height) || 1075;
    const kap = sr.querySelector('hui-view-container') || r;
    const g = kap.getBoundingClientRect().width;
    const bas = sr.querySelector('.header');
    const top = bas && bas.offsetHeight ? bas.getBoundingClientRect().bottom : Math.max(0, kap.getBoundingClientRect().top);
    const y = window.innerHeight - top;
    if (!g || !y) return;
    let gen = Math.max(W, Math.floor(g / y * H));
    const z = Math.max(0.35, Math.min(2, Math.floor(g / gen * 1000) / 1000));
    gen = Math.max(W, Math.floor(g / z));
    // --lp-h: ekranın kalan yüksekliği, kanvas pikseli cinsinden. Kart bunu en az yükseklik olarak kullanır, böylece kolonlar ekranı doldurur.
    // (Ekrandan hesaplanır, içerikten değil: içerik ölçülürse zoom kendini besler.)
    const lh = Math.floor(y / z);
    style(sr, ID, 'hui-view{zoom:' + z + ';width:' + gen + 'px !important;max-width:' + gen + 'px !important;margin:0 auto;flex:0 0 auto !important;min-height:0 !important;height:auto !important;--lp-h:' + lh + 'px;}');
  }
  let canvas = null, kiosk = null, admin = false;
  const run = () => apply(canvas, kiosk);
  window.addEventListener('resize', run);
  window.addEventListener('location-changed', () => { run(); setTimeout(run, 0); setTimeout(run, 100); });
  setInterval(run, 1000);
  return { set(c, k, a) { canvas = c; kiosk = k || null; admin = !!a; run(); }, run: run };
})();
