# Troubleshooting - Error "Tidak dapat terhubung ke server"

## Masalah: Backend API tidak berjalan

Error "Tidak dapat terhubung ke server" terjadi karena **backend API belum dijalankan** atau tidak dapat diakses di `http://127.0.0.1:8000`.

## Solusi

### 1. Pastikan Backend API Sudah Berjalan

Backend API harus berjalan **sebelum** frontend dapat digunakan. 

#### Cara Menjalankan Backend:

**Jika Anda memiliki backend code terpisah:**
```bash
# Masuk ke folder backend
cd ../manprosi-backend  # atau nama folder backend Anda

# Install dependencies (jika belum)
npm install
# atau
pip install -r requirements.txt  # jika Python

# Jalankan backend
npm run dev
# atau
python app.py
# atau sesuai dengan framework yang digunakan
```

**Jika backend menggunakan Python (FastAPI/Flask):**
```bash
# FastAPI
uvicorn main:app --reload --port 8000

# Flask
flask run --port 8000
# atau
python app.py
```

**Jika backend menggunakan Node.js:**
```bash
npm run dev
# atau
node server.js
```

### 2. Verifikasi Backend Berjalan

Buka browser atau gunakan curl untuk test:
```bash
# Test di browser
http://127.0.0.1:8000

# Test dengan PowerShell
Invoke-WebRequest -Uri http://127.0.0.1:8000
```

Atau test endpoint login:
```bash
Invoke-WebRequest -Uri http://127.0.0.1:8000/login -Method POST
```

### 3. Cek Port yang Digunakan

Jika backend berjalan di port yang berbeda (bukan 8000), edit file `.env`:

```env
VITE_API_URL=http://127.0.0.1:PORT_ANDA
```

Contoh jika backend di port 3001:
```env
VITE_API_URL=http://127.0.0.1:3001
```

**PENTING:** Setelah mengubah `.env`, **restart development server** frontend:
```bash
# Stop server (Ctrl+C)
# Lalu jalankan lagi
npm run dev
```

### 4. Cek CORS Configuration

Pastikan backend mengizinkan request dari frontend. Contoh konfigurasi:

**FastAPI (Python):**
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # URL frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Express (Node.js):**
```javascript
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
```

### 5. Cek Database Connection

Pastikan database sudah terhubung dan tabel sudah dibuat:

```bash
# Import schema database
mysql -u root -p < database/mysql_schema.sql
mysql -u root -p < database/mysql_seed.sql
```

### 6. Cek Firewall/Antivirus

Kadang firewall atau antivirus memblokir koneksi localhost. Coba:
- Matikan firewall sementara untuk test
- Tambahkan exception untuk port 8000
- Cek Windows Firewall settings

## Checklist Troubleshooting

- [ ] Backend API sudah dijalankan
- [ ] Backend berjalan di port yang benar (default: 8000)
- [ ] File `.env` sudah dikonfigurasi dengan benar
- [ ] Development server frontend sudah di-restart setelah mengubah `.env`
- [ ] CORS sudah dikonfigurasi di backend
- [ ] Database sudah terhubung dan tabel sudah dibuat
- [ ] Tidak ada firewall/antivirus yang memblokir
- [ ] Port 8000 tidak digunakan oleh aplikasi lain

## Test Koneksi Manual

Gunakan PowerShell untuk test koneksi:

```powershell
# Test apakah port 8000 terbuka
Test-NetConnection -ComputerName 127.0.0.1 -Port 8000

# Test endpoint login
$body = @{
    username = "admin"
    password = "password123"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://127.0.0.1:8000/login -Method POST -Body $body -ContentType "application/json"
```

## Masih Error?

1. **Cek Console Browser (F12)** - Lihat error detail di Network tab
2. **Cek Console Backend** - Lihat apakah ada error di server
3. **Cek Logs** - Lihat log backend untuk detail error
4. **Test dengan Postman/Insomnia** - Test API langsung tanpa frontend

## Informasi yang Diperlukan untuk Debug

Jika masih bermasalah, siapkan informasi berikut:
- Backend framework yang digunakan (FastAPI, Express, Flask, dll)
- Port yang digunakan backend
- Error message lengkap dari browser console
- Error message dari backend logs
- Konfigurasi CORS di backend


