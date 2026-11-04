// routes/siswa.js
const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRole } = require('../middleware/auth');
const {
  getAllSiswa, getSiswaById, createSiswa, updateSiswa, deleteSiswa, getMyProfile
} = require('../controllers/siswaController');

// Admin: CRUD siswa
router.get('/', verifyToken, authorizeRole('admin', 'guru'), getAllSiswa);
router.get('/profile', verifyToken, authorizeRole('siswa'), getMyProfile);
router.get('/:id', verifyToken, authorizeRole('admin', 'guru'), getSiswaById);
router.post('/', verifyToken, authorizeRole('admin'), createSiswa);
router.put('/:id', verifyToken, authorizeRole('admin'), updateSiswa);
router.delete('/:id', verifyToken, authorizeRole('admin'), deleteSiswa);

module.exports = router;
