# MISSING TRUTH - Game Horor Psikologis

**"Kebenaran yang hilang tidak pernah mati... ia hanya menunggumu di dalam kegelapan."**

Game horor eksplorasi 3D berbasis *browser* (Three.js) yang mengajak pemain mencari kebenaran di dalam sebuah rumah tua. Jelajahi setiap ruangan, pecahkan teka-teki, kumpulkan potongan jurnal kebenaran, dan selamatkan diri Anda dari kegelapan.

**Babak I: Rahasia Rumah Tua**

## Fitur Gameplay

- **Eksplorasi 3D 360°** - Pointer Lock *free look* penuh dengan objek lingkungan interaktif.
- **5 Misi Berurutan** - Misi progresif dengan kartu misi aktif dan progress bar.
- **Sistem Teka-Teki** - Interaksi objek, keypad/altar, dan teka-teki yang membuka ruangan baru.
- **Sistem Hadiah & Jurnal** - Setiap misi memberi hadiah alat (seperti Senter Ultra-Lumen) dan potongan dokumen kebenaran.
- **Jurnal Kebenaran** - Kumpulkan 5 potongan jurnal untuk mengungkap rahasia yang terpendam dan menyelesaikan game.
- **Sistem Status** - Baterai senter, sanity (kewarasan), dan stamina yang dinamis.
- **Horor Atmosferik** - Efek jumpscare sesaat, petir luar ruangan, senter berkedip, noise & vignette overlay, dan detak jantung saat sanity menurun.
- **Audio Ambience** - Suasana gelap dengan efek suara yang intensif (disarankan menggunakan earphone/headphone).

## Kontrol

| Tombol | Fungsi |
| --- | --- |
| `Klik Layar` | Kunci mouse - 360° Free Look |
| `W A S D` | Bergerak (dengan animasi head-bobbing) |
| `SHIFT` | Lari kencang (Sprint) |
| `E` / `Klik` | Interaksi objek / teka-teki |
| `F` | Nyalakan / matikan senter |

## Cara Menjalankan

1. **Klon repositori:**
   ```sh
   git clone https://github.com/titaniapanggabean88-bot/missing-truth-.git
   cd missing-truth-
   ```

2. Jalankan server lokal (disarankan karena memuat skrip via CDN):
   ```sh
   # Opsi A: Python
   python -m http.server 8000

   # Opsi B: Node.js (npx)
   npx serve
   ```

3. Buka `http://localhost:8000` di browser, lalu klik **"MULAI MENCARI KEBENARAN"**.

## Teknologi

- **Three.js r128** (via CDN) - Rendering 3D
- **Vanilla JavaScript (ES6)** - Logika game, gameplay, dan audio
- **HTML5 + CSS3** - UI/HUD, overlay, dan efek visual
- **Google Fonts** - Cinzel & Inter

## Struktur Project

```
├── index.html          # Halaman utama game (UI, HUD, modal, overlay)
├── styles.css          # Seluruh styling dark horror aesthetic
├── js/
│   ├── main.js         # Bootstrapper & controller UI
│   ├── renderer.js     # Engine 3D (Three.js) - ruangan, objek, pencahayaan
│   ├── gameplay.js     # Logika misi, teka-teki, inventaris, jurnal
│   └── audio.js        # Audio ambience & efek suara (Web Audio API)
└── README.md
```

## Peringatan

Game ini mengandung **konten horor** termasuk jumpscare, efek suara keras, dan suasana mencekam. Jangan dimainkan oleh penderita masalah jantung. Gunakan **earphone/headphone** untuk pengalaman maksimal.

---

Dibuat dengan ❤️ oleh titaniapanggabean88-bot.