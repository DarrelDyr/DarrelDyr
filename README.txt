PORTFOLIO DARREL — TUTORIAL GITHUB

Versi ini sudah diperbarui agar:
- foto profil kamu sudah dipasang;
- PNG/JPG/WEBP/GIF sertifikat otomatis muncul;
- PDF sertifikat juga otomatis muncul sebagai preview di halaman;
- kamu cukup upload file sertifikat ke GitHub, tidak perlu mengubah index.html;
- tombol sertifikat membuka gambar/PDF dalam tampilan besar.

============================================================
1. STRUKTUR FOLDER
============================================================
portfolio-darrel/
├── index.html
├── style.css
├── script.js
├── config.js
├── README.txt
└── assets/
    ├── profile/
    │   └── darrel-profile.png
    └── certificates/
        └── id-networkers.png

============================================================
2. UPLOAD KE GITHUB
============================================================
Upload ISI folder website ke repository, bukan file ZIP.
Contoh repository:
    portfolio-darrel

Pastikan folder assets/certificates/ ikut di-upload.

============================================================
3. WAJIB ATUR config.js
============================================================
Buka file config.js.

Ubah:
    owner: "USERNAME_GITHUB_KAMU"
    repo: "NAMA_REPOSITORY_KAMU"

Contoh:
    const GITHUB_CONFIG = {
      owner: "darrel123",
      repo: "portfolio-darrel",
      branch: "main",
      certificateFolder: "assets/certificates"
    };

owner = username GitHub kamu, TANPA tanda @.
repo = nama repository GitHub.
branch biasanya main.

Jangan masukkan GitHub Personal Access Token ke file website.

============================================================
4. CARA MENAMBAH SERTIFIKAT PNG/JPG
============================================================
Setiap punya sertifikat gambar baru:

1. Buka repository GitHub.
2. Masuk ke:
       assets/certificates/
3. Pilih Add file -> Upload files.
4. Upload file sertifikat.
5. Commit changes.
6. Refresh website.

Contoh:
    sertifikat-docker.png
    sertifikat-linux.jpg

TIDAK perlu mengubah HTML/CSS/JavaScript.

============================================================
5. CARA MENAMBAH SERTIFIKAT PDF
============================================================
PDF TIDAK perlu dikonversi ke PNG.

Upload langsung:
    sertifikat-mikrotik.pdf

ke:
    assets/certificates/

Website otomatis mengenali ekstensi .pdf dan membuat preview PDF.
File asli tetap PDF.

============================================================
6. FOTO PROFIL
============================================================
Foto profil yang kamu kirim sudah dipasang sebagai:
    assets/profile/darrel-profile.png

Kalau mau mengganti foto, ganti file tersebut dengan foto baru.
Nama file harus tetap:
    darrel-profile.png

Atau jika mau nama lain, ubah path di index.html pada tag img profil.

============================================================
7. GITHUB PAGES
============================================================
Di GitHub repository:
    Settings -> Pages
    Source: Deploy from a branch
    Branch: main
    Folder: / (root)
    Save

Setelah aktif, GitHub akan memberi URL website.
Bentuk umumnya:
    https://USERNAME.github.io/NAMA-REPOSITORY/

============================================================
8. KENAPA SERTIFIKAT BISA OTOMATIS MUNCUL?
============================================================
script.js membaca daftar file dari folder assets/certificates melalui
GitHub Contents API.

Alurnya:
    Upload file
       -> GitHub
       -> GitHub API
       -> script.js membaca file
       -> website membuat kartu
       -> sertifikat muncul

Format yang didukung:
    .png
    .jpg
    .jpeg
    .webp
    .gif
    .pdf

============================================================
9. PENTING: REPOSITORY HARUS PUBLIC
============================================================
Versi ini membaca file GitHub langsung dari browser pengunjung.
Karena itu repository sebaiknya Public.

Jangan memasukkan token GitHub ke frontend.
Jika repository ingin Private, nanti lebih baik dibuatkan backend/login
admin sendiri.

============================================================
10. KALAU SERTIFIKAT TIDAK MUNCUL
============================================================
Cek:
[ ] repository Public
[ ] owner di config.js benar
[ ] repo di config.js benar
[ ] branch benar
[ ] folder assets/certificates benar
[ ] file sudah di-commit
[ ] ekstensi file didukung
[ ] refresh halaman

Jika masih gagal, buka F12 -> Console untuk melihat pesan error.

============================================================
11. CATATAN TENTANG NAMA SERTIFIKAT
============================================================
Website mengambil judul dari nama file.

Contoh:
    sertifikat-mikrotik-vpn-ospf.pdf

akan tampil sebagai:
    Sertifikat Mikrotik Vpn Ospf

Nanti kalau mau, sistem bisa dikembangkan agar tiap sertifikat punya:
- nama sertifikat
- penyelenggara
- tanggal
- deskripsi
- nomor sertifikat
- link credential

============================================================
12. VERSI BERIKUTNYA
============================================================
Kalau ingin lebih profesional, portfolio ini bisa dibuat menjadi:
Login Admin -> Dashboard -> Upload Sertifikat -> Isi Data -> Simpan.

Dengan begitu kamu tidak perlu mengedit file atau membuka kode sama sekali.
