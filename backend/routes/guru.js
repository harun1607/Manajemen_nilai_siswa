// routes/guru.js
const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRole } = require('../middleware/auth');
const {
  getAllGuru, getGuruById, createGuru, updateGuru, deleteGuru, getMyProfile
} = require('../controllers/guruController');

// Admin: CRUD guru
router.get('/', verifyToken, authorizeRole('admin'), getAllGuru);
router.get('/profile', verifyToken, authorizeRole('guru'), getMyProfile);
router.get('/:id', verifyToken, authorizeRole('admin'), getGuruById);
router.post('/', verifyToken, authorizeRole('admin'), createGuru);
router.put('/:id', verifyToken, authorizeRole('admin'), updateGuru);
router.delete('/:id', verifyToken, authorizeRole('admin'), deleteGuru);

module.exports = router;
