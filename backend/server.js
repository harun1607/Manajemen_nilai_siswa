// server.js
// Entry point aplikasi Pengolahan Nilai Siswa
// Stack: Node.js + Express + MongoDB (Mongoose)

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================
// MIDDLEWARE
// ============================================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// ============================================================
// DATABASE CONNECTION
// ============================================================
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB terhubung:', process.env.MONGO_URI);
    await seedAdmin(); // Buat akun admin default jika belum ada
  })
  .catch((err) => {
    console.error('❌ Gagal terhubung ke MongoDB:', err.message);
    process.exit(1);
  });

// ============================================================
// SEED: Admin default
// ============================================================
async function seedAdmin() {
  const Admin = require('./models/Admin');
  const existing = await Admin.findOne({ username: 'admin' });
  if (!existing) {
    await Admin.create({
      username: 'admin',
      password: 'admin123',
      nama: 'Administrator',
    });
    console.log('👤 Akun admin default dibuat: username=admin | password=admin123');
  }
}

// ============================================================
// ROUTES API
// ============================================================
app.use('/api/auth', require('./routes/auth'));
app.use('/api/siswa', require('./routes/siswa'));
app.use('/api/guru', require('./routes/guru'));
app.use('/api/nilai', require('./routes/nilai'));
app.use('/api/matpel', require('./routes/matpel'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server berjalan dengan baik.',
    database: mongoose.connection.readyState === 1 ? 'Terhubung' : 'Tidak terhubung',
    timestamp: new Date().toISOString(),
  });
});

// Fallback: semua route non-API ke index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ============================================================
// ERROR HANDLER GLOBAL
// ============================================================
app.use((err, req, res, next) => {
  console.error('⚠️  Error:', err.message);
  res.status(500).json({ success: false, message: err.message || 'Terjadi kesalahan server.' });
});

// ============================================================
// START SERVER
// ============================================================
app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});
