# İsmet Home

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

<sub>Lisans: GPL-3.0 ([LICENSE](LICENSE), [NOTICE.md](NOTICE.md)). Bu proje değiştirilmiş bir türevdir. Based on Lemur Home Dashboard by mendeburlemur — https://github.com/mendebur-lemur/lemur-home-dashboard</sub>
