# Palm Oil Monitoring System - Frontend

Aplikasi frontend untuk sistem monitoring kelapa sawit menggunakan React, TypeScript, dan TanStack Router.

## Prerequisites

Pastikan Anda telah menginstall:
- Node.js (versi 18 atau lebih baru)
- npm atau yarn atau bun

## Instalasi

1. Install dependencies:
```bash
npm install
# atau
yarn install
# atau
bun install
```

## Konfigurasi

File `.env` sudah disediakan dengan konfigurasi default:
```
VITE_API_URL=http://127.0.0.1:8000
```

Jika backend API Anda berjalan di URL yang berbeda, edit file `.env` dan sesuaikan `VITE_API_URL`.

## Setup Database dan User

⚠️ **PENTING:** Sebelum bisa login, Anda perlu setup database dan membuat user terlebih dahulu!

### Quick Setup (Paling Mudah)

File SQL database sudah tersedia di folder `database/`:

**MySQL/MariaDB:**
```bash
mysql -u root -p < database/mysql_schema.sql
mysql -u root -p < database/mysql_seed.sql
```

Setelah import, langsung bisa login dengan:
- **Admin:** username=`admin`, password=`password123`
- **Farmer:** username=`farmer1`, password=`password123`
- **Consultant:** username=`consultant1`, password=`password123`

Lihat file [SETUP.md](./SETUP.md) dan [database/README.md](./database/README.md) untuk panduan lengkap.

## Menjalankan Aplikasi

### Development Mode

Jalankan aplikasi dalam mode development:
```bash
npm run dev
# atau
yarn dev
# atau
bun run dev
```

Aplikasi akan berjalan di `http://localhost:3000`

### Build untuk Production

Build aplikasi untuk production:
```bash
npm run build
# atau
yarn build
# atau
bun run build
```

File hasil build akan berada di folder `dist/`

### Preview Production Build

Preview hasil build production:
```bash
npm run serve
# atau
yarn serve
# atau
bun run serve
```

## Struktur Proyek

```
src/
├── routes/          # Halaman-halaman aplikasi
│   ├── login.tsx    # Halaman login
│   ├── admin/       # Dashboard admin
│   ├── client/      # Dashboard client/farmer
│   └── consultant/  # Dashboard consultant
├── stores/          # State management (Zustand)
├── constants.ts     # Konstanta aplikasi
└── main.tsx         # Entry point aplikasi
```

## Fitur

- ✅ Login dengan autentikasi
- ✅ Dashboard Admin (manajemen users)
- ✅ Dashboard Client (manajemen lahan, sensors, plants, dll)
- ✅ Dashboard Consultant (manajemen seeds dan recommendations)
- ✅ UI modern dan responsif
- ✅ Real-time data dengan React Query

## Teknologi yang Digunakan

- React 19
- TypeScript
- TanStack Router
- TanStack Query (React Query)
- Tailwind CSS
- Zustand (State Management)
- Lucide React (Icons)
- Vite

## Troubleshooting

### Port sudah digunakan
Jika port 3000 sudah digunakan, edit `package.json` dan ubah port di script `dev`:
```json
"dev": "vite --port 3001"
```

### API tidak terhubung
Pastikan:
1. Backend API sudah berjalan
2. URL di file `.env` sudah benar
3. CORS sudah dikonfigurasi di backend untuk mengizinkan request dari frontend

### Error saat install dependencies
Coba hapus `node_modules` dan `package-lock.json` (atau `yarn.lock`), lalu install ulang:
```bash
rm -rf node_modules package-lock.json
npm install
```

