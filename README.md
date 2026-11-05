# İsmet Home

Türkçe · **[English](#english)**

Home Assistant için hazır, tam ekran ev panosu ve yönetim paneli. Duvar tabletleri, kiosk ekranları ve telefonlar için tasarlandı. Odalar, ışıklar, senaryolar, iklim, medya, kameralar ve otomasyonlar tek panoda; her şey Home Assistant'ın içindeki yönetim panelinden, kod yazmadan düzenlenir.

**Hızlı kurulum:** HACS → ⋮ → Özel depolar → `https://github.com/ig-86/ig-home` (Entegrasyon) → İndir → Home Assistant'ı yeniden başlat → **Ayarlar → Cihazlar ve hizmetler → Entegrasyon ekle → İsmet Home**.

## Öne çıkanlar

- **Kendiliğinden kurulan pano.** Entegrasyonu eklerken pano da oluşturulur. Odalar Home Assistant alanlarından; ışıklar, senaryolar, klimalar, petekler, süpürge, medya cihazları ve kameralar o alanlardan bulunur.
- **Başka eklenti gerekmez.** mushroom, card-mod ya da tema istemez; iklim, süpürge, sensör, hava, enerji, güvenlik, oda ve ışık kartları pakete gömülü.
- **Her şey yönetim panelinden.** Sekmeler, bölümler, kolon genişlikleri ve hangi cihazın nerede duracağı canlı önizlemeyle düzenlenir; değişiklik evdeki bütün tabletlere aynı anda gider. Her adım geri alınabilir.
- **Canlı sürükle bırak.** Düzenlerken öğeler, bölüm kutuları, sekmeler ve listeler parmağı izler; ötekiler canlı olarak kenara kayıp yer açar.
- **Otomasyonlar kartı.** Bütün otomasyonlar tek kartta: arama, filtre, tek dokunuşla aç/kapat ve **süreli durdurma** (5 dk - 3 saat). Süre bitince otomasyon kendiliğinden geri açılır, Home Assistant yeniden başlasa da unutulmaz.
- **Işığa çift dokun.** O ışığı yöneten otomasyonlar açılır; oradan kapatır ya da süreli durdurursun.
- **Açık olanlar kartı.** Evde açık kalan ışık ve anahtarlar listelenir; tek tek ya da hepsi birden kapatılır.
- **Kameralar.** Anlık görüntü karosu, birkaç saniyede bir yenilenir (5 sn - 1 dk). Dokununca neredeyse tam ekran canlı görüntü. **Kameralar sekmesi** bütün kameraları tek sayfada toplar.
- **Kopyala / yapıştır.** Öğeler, bölümler ve sekmeler bütün ayarlarıyla kopyalanıp başka yere yapıştırılır.
- **Işık penceresi.** Işığa basılı tutunca büyük parlaklık çubuğu, beyaz tonlar, renk çemberi, hazır renkler, efektler ve segmentler.
- **Anında tepki.** Işığa, prize ya da fana dokununca karo cihazın cevabını beklemeden değişir.
- **Telefonda kendi düzeni.** Altta kategoriler (Tümü, Işıklar, İklim, Senaryolar, Kameralar, Otomasyonlar, Diğer); her düğme gizlenebilir ve yeniden adlandırılabilir. İstediğin sekme telefonda kendi düğmesiyle ayrı sayfa olur.
- **Sadece yönetici sekmeleri.** Bir sekme (ör. Otomasyonlar) yalnız yönetici olarak girenlere gösterilir.
- **Kiosk modu.** Home Assistant'ın üst barı ve yan menüsü yalnız bu panoda gizlenir; yöneticiye sol altta küçük bir menü düğmesi çıkar.
- **Besleme kartı.** Kedi, köpek, balık... için besleme hatırlatıcısı: zamanında yeşil, gecikince kırmızı, istersen telefona bildirim.
- **Yedek kontrol ve duvar anahtarları.** İki entegrasyonda görünen lambaya yedek yol seçilir; yalnız sinyal veren duvar rölesi bir lambaya bağlanır.
- **Mevsime göre iklim.** Yazın klimalar, kışın petekler.
- **Her ekrana uyar.** 16:10, 4:3 ve geniş ekranlarda aynı oranla ölçeklenir; eski tabletlerde de akıcı çalışır.
- **Işık efektleri (isteğe bağlı).** [İsmet Light Effect Card](https://github.com/ig-86/ig-light-effect) kuruluysa üst şeride Efektler düğmesi gelir.
- Türkçe ve İngilizce arayüz.

## Kurulum

Gerekenler: Home Assistant 2024.8 ya da daha yeni. Home Assistant 2026.11 ve sonrasında **Ayarlar → Marketplace**, daha eski sürümlerde [HACS](https://hacs.xyz/docs/use/).

1. **İndir:** HACS (ya da Marketplace) → sağ üstte **⋮** → **Özel depolar** → depo: `https://github.com/ig-86/ig-home`, tür: **Entegrasyon** → **Ekle**. Listeden **İsmet Home** → **İndir**.
2. **Yeniden başlat:** Ayarlar → Sistem → ⏻ → Home Assistant'ı yeniden başlat.
3. **Entegrasyonu ekle:** Ayarlar → Cihazlar ve hizmetler → **Entegrasyon ekle** → "İsmet" yaz → **İsmet Home** → **Gönder**. **Panoyu oluştur** açık gelir; sayfayı bir kez yenileyince pano sol menüde görünür.
4. **Düzenle:** Sol menüdeki **İsmet Home** yönetim panelini aç. Hiçbir şeye dokunmadan da kullanabilirsin; ilk değişiklikte otomatik düzen kaydedilir, sonrası tamamen senin.

<details>
<summary>Panoyu elle oluşturmak</summary>

**Ayarlar → Panolar → Pano ekle → Sıfırdan yeni pano**, ad ver, aç → ✏️ → ⋮ → **Ham yapılandırma düzenleyicisi** → içini silip şunu yapıştır:

```yaml
strategy:
  type: custom:ismet-home
```

Bu panoda Home Assistant'ın kendi düzenleyicisinde "Kontrolü al" dersen pano sabitlenir ve İsmet Home'dan kopar; düzenlemeyi her zaman İsmet Home yönetim panelinden yap.

</details>

## Güncelleme

Yönetim panelinde **Ayarlar → Sürüm** yeni sürümü gösterir ve **Güncelle** düğmesiyle HACS ya da Marketplace'ten indirir; ardından Home Assistant'ı yeniden başlat. Her güncellemeden sonra yeniliklerin özeti bir kez gösterilir.

## Sorun bildir

Yönetim panelinde **Ayarlar → Sorun bildir** sürüm ve cihaz bilgisiyle GitHub'da kayıt açar (oda, cihaz ya da kişi adı eklenmez).

---

## English

A ready-made, full-screen home dashboard and admin panel for Home Assistant, designed for wall tablets, kiosk screens and phones. Rooms, lights, scenes, climate, media, cameras and automations on one dashboard; everything is edited in the admin panel inside Home Assistant, without writing code.

**Quick install:** HACS → ⋮ → Custom repositories → `https://github.com/ig-86/ig-home` (Integration) → Download → restart Home Assistant → **Settings → Devices & services → Add integration → İsmet Home**.

### Highlights

- **A dashboard that builds itself.** The dashboard is created when you add the integration. Rooms come from Home Assistant areas; lights, scenes, air conditioners, radiators, vacuums, media players and cameras are found in those areas.
- **No other add-ons needed.** No mushroom, card-mod or theme required; climate, vacuum, sensor, weather, energy, security, room and light cards are built in.
- **Everything from the admin panel.** Tabs, sections, column widths and where each device goes are edited with a live preview; changes reach every tablet in the home at once. Every step can be undone.
- **Live drag and drop.** While editing, items, section boxes, tabs and lists follow your finger; the others move aside live to make room.
- **Automations card.** All automations in one card: search, filters, one-tap on/off and **timed pause** (5 min - 3 h). When the time is up the automation turns itself back on, even after a Home Assistant restart.
- **Double-tap a light.** Opens the automations that control it; switch them off or pause them from there.
- **Turned-on card.** Lists the lights and switches left on in the home; turn them off one by one or all at once.
- **Cameras.** Snapshot tiles that refresh every few seconds (5 s - 1 min). Tap for an almost full-screen live view. The **Cameras tab** puts every camera on one page.
- **Copy / paste.** Items, sections and whole tabs are copied with all their settings and pasted elsewhere.
- **Light window.** Hold a light for a large brightness bar, white tones, a colour wheel, preset colours, effects and segments.
- **Instant response.** Tap a light, plug or fan and the tile changes without waiting for the device to answer.
- **Its own phone layout.** Categories at the bottom (All, Lights, Climate, Scenes, Cameras, Automations, Other); every button can be hidden or renamed. Any tab can become its own page with its own button on the phone.
- **Admin-only tabs.** A tab (e.g. Automations) is shown only to people signed in as admin.
- **Kiosk mode.** Home Assistant's top bar and sidebar are hidden on this dashboard only; admins get a small menu button at the bottom left.
- **Feeding card.** A feeding reminder for cats, dogs, fish...: green when on time, red when late, with an optional phone notification.
- **Backup control and wall switches.** A light that shows up in two integrations gets a backup path; a wall relay that only sends a signal can be linked to a light.
- **Climate by season.** Air conditioners in summer, radiators in winter.
- **Fits every screen.** Scales with the same proportions on 16:10, 4:3 and wide screens; runs smoothly on older tablets too.
- **Light effects (optional).** With [İsmet Light Effect Card](https://github.com/ig-86/ig-light-effect) installed, an Effects button appears in the top bar.
- Turkish and English interface.

### Installation

Requirements: Home Assistant 2024.8 or newer. On Home Assistant 2026.11 and later use **Settings → Marketplace**, on older versions [HACS](https://hacs.xyz/docs/use/).

1. **Download:** HACS (or Marketplace) → **⋮** at the top right → **Custom repositories** → repository: `https://github.com/ig-86/ig-home`, type: **Integration** → **Add**. Pick **İsmet Home** from the list → **Download**.
2. **Restart:** Settings → System → ⏻ → Restart Home Assistant.
3. **Add the integration:** Settings → Devices & services → **Add integration** → type "İsmet" → **İsmet Home** → **Submit**. **Create dashboard** is on by default; refresh the page once and the dashboard shows up in the sidebar.
4. **Edit:** Open the **İsmet Home** admin panel in the sidebar. You can use it without touching anything; the automatic layout is saved on your first change, and from then on it is all yours.

<details>
<summary>Creating the dashboard by hand</summary>

**Settings → Dashboards → Add dashboard → New dashboard from scratch**, give it a name, open it → ✏️ → ⋮ → **Raw configuration editor** → replace everything with:

```yaml
strategy:
  type: custom:ismet-home
```

If you choose "Take control" in Home Assistant's own editor on this dashboard, it becomes fixed and is no longer managed by İsmet Home; always edit it from the İsmet Home admin panel.

</details>

### Updating

In the admin panel, **Settings → Version** shows new versions and the **Update** button downloads them from HACS or the Marketplace; then restart Home Assistant. After each update a short summary of what's new is shown once.

### Reporting a problem

In the admin panel, **Settings → Report a problem** opens a GitHub issue with the version and device details (no room, device or person names are included).

---

<sub>Lisans / License: GPL-3.0 ([LICENSE](LICENSE), [NOTICE.md](NOTICE.md)). Bu proje değiştirilmiş bir türevdir / This project is a modified derivative. Based on Lemur Home Dashboard by mendeburlemur — https://github.com/mendebur-lemur/lemur-home-dashboard</sub>
