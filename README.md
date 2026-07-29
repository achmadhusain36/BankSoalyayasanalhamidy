# Pembuat Soal Al-Hamidy AI - Pringsewu

Aplikasi pembuat soal asesmen otomatis berstandar **Kurikulum Merdeka** berbasis AI (Gemini 3.6 Flash) untuk **SMP Qur'an Al-Hamidy** dan **SMA Plus Al-Hamidy Banyuanyar**.

---

## 🚀 Fitur Utama

- **Generator Soal AI Berbasis Prompt Kurikulum Merdeka**: Membuat soal Pilihan Ganda, PG Kompleks (Benar/Salah), Menjodohkan, Isian Singkat, dan Uraian lengkap dengan stimulus, elemen CP, indikator soal, tingkat kognitif Bloom (HOTS/MOTS/LOTS), serta kunci jawaban dan rubrik penilaian.
- **Editor & Preview Format A4 Real-time**: Mengedit kisi-kisi, teks soal, opsi, dan kunci secara langsung dengan tampilan layout A4 siap cetak.
- **Manajemen Kop Surat Custom**: Konfigurasi Kop Surat SMP / SMA (logo, alamat, naskah) serta dukungan upload banner PNG kop surat penuh.
- **Export Multi-Format**: Ekspor dokumen soal ke format **Microsoft Word (.docx)** dan **Cetak / Simpan PDF** dengan penanganan rendering gambar async.
- **Bank Soal Lokal**: Menyimpan dan mengelola koleksi naskah soal secara lokal di browser (`localStorage`).

---

## 🛠️ Persyaratan System

- **Node.js**: v18.x atau lebih baru
- **Package Manager**: `npm` atau `bun`

---

## 📦 Setup & Instalasi Lokal

1. **Salin file lingkungan (.env)**:
   ```bash
   cp .env.example .env.local
   ```

2. **Konfigurasi Environment Variable**:
   Isi `GEMINI_API_KEY` pada file `.env.local`:
   ```env
   GEMINI_API_KEY="AIzaSyYourGeminiApiKeyHere"
   ```

3. **Instal Dependensi**:
   ```bash
   npm install
   ```

4. **Jalankan Dev Server**:
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan di `http://localhost:3000`.

---

## 🧪 Linting & Build Standard

- **Menjalankan Linter**:
  ```bash
  npm run lint
  ```
- **Build Produksi**:
  ```bash
  npm run build
  ```
- **Menjalankan Hasil Build**:
  ```bash
  npm run start
  ```

---

## 📡 API Endpoint Documentation

### POST `/api/generate-exam`

Memanggil server-side Gemini 3.6 Flash untuk menghasilkan struktur dokumen soal JSON sesuai parameter yang dikirim.

**Header**:
`Content-Type: application/json`

**Sample Payload**:
```json
{
  "institution": "SMP Qur'an Al-Hamidy",
  "grade": "Kelas 7",
  "subject": "Tahfizh Al-Qur'an & Tajwid",
  "assessmentType": "Summative",
  "assessmentTitle": "Sumatif Tengah Semester (STS) Ganjil",
  "semester": "Ganjil",
  "academicYear": "2025/2026",
  "capaianPembelajaran": "Memahami kaidah Tajwid Nun Sukun dan Mim Sukun",
  "tujuanPembelajaran": "Siswa dapat membedakan hukum bacaan Izhar dan Idgham",
  "topics": "Hukum Nun Sukun dan Mim Sukun",
  "bloomsDistribution": { "HOTS": 30, "MOTS": 50, "LOTS": 20 },
  "questionCounts": {
    "pilihanGanda": 5,
    "pgKompleks": 2,
    "menjodohkan": 2,
    "isianSingkat": 2,
    "uraian": 2
  },
  "customInstruction": "Gunakan ayat Al-Qur'an dengan harakat rapi."
}
```

**Response Success (HTTP 200)**:
Mengembalikan objek `ExamDocument` yang berisi `title`, `institution`, `grade`, `subject`, array `questions`, dan `kisiKisiMatrix`.

**Error Handling**:
- **HTTP 400**: Payload invalid (tipe data salah / objek tidak valid).
- **HTTP 500**: `GEMINI_API_KEY` belum dikonfigurasi atau AI gagal memberikan format JSON yang valid.

---

## 🔒 Keamanan & Good Practices

1. **Server-side Key Protection**: Key `GEMINI_API_KEY` dipanggil dari API route server-side (`/api/generate-exam/route.ts`) dan **tidak pernah** diekspos ke client-side / browser bundle.
2. **Dynamic Client Import**: Library client-only seperti `file-saver` di-load via dynamic import saat aksi ekspor `.docx` untuk mencegah crash pada Next.js Server Side Rendering (SSR).
