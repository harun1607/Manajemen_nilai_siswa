// routes/nilai.js
const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRole } = require('../middleware/auth');
const {
  inputNilai, updateNilai, deleteNilai,
  getNilaiBySiswa, getMyNilai, getLaporanKelas, getAllNilai
} = require('../controllers/nilaiController');

// Siswa: lihat nilai sendiri
router.get('/my', verifyToken, authorizeRole('siswa'), getMyNilai);

// Guru & Admin: input dan kelola nilai
router.post('/', verifyToken, authorizeRole('guru'), inputNilai);
router.put('/:id', verifyToken, authorizeRole('guru', 'admin'), updateNilai);
router.delete('/:id', verifyToken, authorizeRole('admin'), deleteNilai);

// Laporan kelas (guru & admin)
router.get('/laporan', verifyToken, authorizeRole('guru', 'admin'), getLaporanKelas);

// Semua nilai (admin)
router.get('/all', verifyToken, authorizeRole('admin'), getAllNilai);

// Nilai per siswa (guru & admin)
router.get('/siswa/:siswaId', verifyToken, authorizeRole('guru', 'admin'), getNilaiBySiswa);

module.exports = router;
