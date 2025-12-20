# Setup Database dan User untuk Login

## Prerequisites

Sebelum bisa login, Anda perlu:

1. **Backend API sudah berjalan** di `http://127.0.0.1:8000` (atau sesuai konfigurasi di `.env`)
2. **Database sudah terhubung** dan tabel-tabel sudah dibuat
3. **User pertama sudah dibuat** di database

## Struktur User yang Diperlukan

Berdasarkan kode aplikasi, struktur user memerlukan:

- `id`: ID user (integer)
- `username`: Username untuk login (string)
- `password`: Password yang sudah di-hash (string)
- `user_role_id`: ID role user (integer)
  - `1` = Admin
  - `2` = Farmer
  - `3` = Consultant
- `role`: Nama role (string) - biasanya "admin", "client"/"farmer", atau "consultant"

## Cara Setup Database

### Quick Start (Recommended)

File database SQL sudah tersedia di folder `database/`:

1. **MySQL/MariaDB:**
   ```bash
   mysql -u root -p < database/mysql_schema.sql
   mysql -u root -p < database/mysql_seed.sql
   ```

2. **PostgreSQL:**
   ```bash
   psql -U postgres -d palm_oil_monitoring -f database/schema.sql
   psql -U postgres -d palm_oil_monitoring -f database/seed.sql
   ```

3. **SQLite:**
   ```bash
   sqlite3 palm_oil_monitoring.db < database/schema.sql
   sqlite3 palm_oil_monitoring.db < database/seed.sql
   ```

Lihat `database/README.md` untuk panduan lengkap.

## Cara Setup User Pertama

### Opsi 1: Via Backend API (Recommended)

Jika backend menyediakan endpoint untuk create user, Anda bisa membuat user pertama melalui:

**Endpoint:** `POST /users`

**Request Body:**
```json
{
  "username": "admin",
  "password": "password123",
  "user_role_id": 1
}
```

**Contoh menggunakan curl:**
```bash
curl -X POST http://127.0.0.1:8000/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "password123",
    "user_role_id": 1
  }'
```

### Opsi 2: Via Database Langsung

Jika Anda perlu insert langsung ke database, pastikan password sudah di-hash terlebih dahulu.

**Contoh SQL (PostgreSQL):**
```sql
-- Pastikan password di-hash dengan bcrypt atau method yang sama dengan backend
INSERT INTO users (username, password, user_role_id, created_at, updated_at)
VALUES 
  ('admin', '$2b$10$hashed_password_here', 1, NOW(), NOW()),
  ('farmer1', '$2b$10$hashed_password_here', 2, NOW(), NOW()),
  ('consultant1', '$2b$10$hashed_password_here', 3, NOW(), NOW());
```

**Contoh SQL (MySQL):**
```sql
INSERT INTO users (username, password, user_role_id, created_at, updated_at)
VALUES 
  ('admin', '$2b$10$hashed_password_here', 1, NOW(), NOW()),
  ('farmer1', '$2b$10$hashed_password_here', 2, NOW(), NOW()),
  ('consultant1', '$2b$10$hashed_password_here', 3, NOW(), NOW());
```

### Opsi 3: Via Frontend (Setelah Admin Login)

Setelah admin pertama dibuat, Anda bisa login sebagai admin dan membuat user lain melalui:
- Dashboard Admin → Tab "users" → Button "Create User"

## User Default untuk Testing

Berikut adalah contoh user yang bisa dibuat untuk testing:

### Admin User
- **Username:** `admin`
- **Password:** `admin123`
- **Role ID:** `1` (Admin)

### Farmer User
- **Username:** `farmer1`
- **Password:** `farmer123`
- **Role ID:** `2` (Farmer)

### Consultant User
- **Username:** `consultant1`
- **Password:** `consultant123`
- **Role ID:** `3` (Consultant)

## Verifikasi Setup

Setelah membuat user, verifikasi dengan:

1. **Cek Backend API:**
   ```bash
   curl http://127.0.0.1:8000/users
   ```

2. **Test Login via Frontend:**
   - Buka `http://localhost:3000/login`
   - Pilih role yang sesuai
   - Masukkan username dan password
   - Klik "Sign In"

## Troubleshooting

### Error: "Cannot find module" atau "Failed to fetch"
- Pastikan backend API sudah berjalan
- Cek URL di file `.env` sudah benar
- Cek CORS settings di backend

### Error: "Invalid credentials"
- Pastikan username dan password sudah benar
- Pastikan role yang dipilih sesuai dengan user_role_id di database
- Cek apakah password sudah di-hash dengan benar

### Error: "Not authenticated"
- Pastikan backend mengembalikan cookie/session yang valid
- Cek credentials: "include" di fetch request

## Catatan Penting

⚠️ **Security Warning:**
- Jangan gunakan password default di production
- Pastikan password di-hash dengan algoritma yang kuat (bcrypt, argon2, dll)
- Gunakan HTTPS di production
- Jangan commit file `.env` ke repository

