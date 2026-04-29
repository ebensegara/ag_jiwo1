# Sistem Booking Profesional (Jiwo.AI)

Dokumen ini menjelaskan rancangan sistem booking untuk layanan kesehatan mental dan profesional development (Psikolog, Psikiater, Life Coach, dsb).

## 1. Ikhtisar Sistem
Sistem booking ini dirancang untuk menangani penjadwalan yang dinamis di mana setiap profesional memiliki kendali penuh atas ketersediaan waktu mereka, sementara pasien/klien dapat melakukan reservasi dengan mudah melalui platform.

## 2. Struktur Data (Proposed Tables)

### a. `professionals`
Menyimpan profil tenaga ahli.
- `id`: UUID (Primary Key)
- `user_id`: UUID (FK to users)
- `full_name`: String
- `title`: String (e.g., "Psikolog Klinis")
- `bio`: Text
- `specialties`: String[] (e.g., ["Kecemasan", "Depresi"])
- `hourly_rate`: Decimal
- `is_active`: Boolean

### b. `availability_slots`
Mengelola jadwal ketersediaan mandiri oleh profesional.
- `id`: UUID
- `professional_id`: UUID (FK)
- `day_of_week`: Integer (0-6)
- `start_time`: Time
- `end_time`: Time
- `is_recurring`: Boolean

### c. `bookings`
Transaksi booking oleh user.
- `id`: UUID
- `user_id`: UUID (Pasien)
- `professional_id`: UUID
- `start_time`: Timestamp
- `end_time`: Timestamp
- `status`: Enum ('pending', 'confirmed', 'completed', 'cancelled', 'rescheduled')
- `payment_status`: Enum ('unpaid', 'paid', 'refunded')
- `notes`: Text (Keluhan awal singkat)

## 3. Fitur Utama

### A. Pengelolaan Jadwal (Availability)
- **Profesional Dashboard**: Antarmuka bagi profesional untuk mengatur jam kerja.
- **Dynamic Slots**: Penambahan slot instan atau jadwal berulang (misal: setiap Senin jam 09:00 - 11:00).
- **Time Off/Blackout Dates**: Fitur untuk menutup jadwal pada tanggal tertentu (libur/izin).

### B. Alur Booking User (Pasien)
- **Pencarian & Filter**: Mencari profesional berdasarkan spesialisasi, harga, atau rating.
- **Kalender Interaktif**: Pasien hanya bisa melihat slot yang berstatus "Available" dan belum dipesan orang lain.
- **Konfirmasi Instan**: Slot langsung dikunci selama proses pembayaran (jika ada) untuk menghindari *double booking*.

### C. Konfirmasi & Reminder
- **Automation **: Integrasi webhook dengan n8n untuk otomatisasi notifikasi.
- **Notifikasi Otomatis**: Email dan WhatsApp pengingat pada:
  - H-24 Jam sebelum sesi.
  - H-1 Jam sebelum sesi.
- **Link Sesi**: Integrasi link video call (Zoom/Google Meet/Jitsi) yang dikirim otomatis setelah konfirmasi.

### D. Reschedule & Pembatalan
- **Kebijakan Pembatalan**: 
  - Pembatalan > 24 jam: Refund penuh/sebagian.
  - Pembatalan < 24 jam: Hangus (kebijakan dapat dikonfigurasi).
- **Alur Reschedule**: Pasien mengajukan permintaan pindah jadwal, profesional harus memberikan persetujuan (approval) atau sistem otomatis memindahkan jika slot baru tersedia.

### E. Integrasi Pembayaran
- **Gateway**: Menggunakan iPay88 .
- **Escrow System**: Dana ditahan oleh sistem dan baru diteruskan ke profesional setelah sesi dinyatakan selesai (`completed`).

## 4. Alur Kerja Teknis (Workflow)

1. **Setup**: Profesional masuk ke dashboard -> Atur Availability.
2. **Discovery**: Pasien mencari Psikolog -> Pilih Jadwal -> Klik "Book Now".
3. **Payment**: Pasien membayar via QRIS/VA -> Status Booking berubah ke `confirmed`.
4. **Execution**: Link meeting aktif pada waktu yang ditentukan.
5. **Closure**: Sesi selesai -> Profesional menandai `completed` -> Dana diteruskan.

## 5. Pertimbangan Skalabilitas
- **Timezone Support**: Penting jika profesional dan pasien berada di zona waktu berbeda (UTC storage).
- **Concurrency Control**: Menggunakan Database Transaction untuk mencegah dua orang memesan slot yang sama di milidetik yang sama.
