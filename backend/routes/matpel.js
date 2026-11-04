// routes/matpel.js
const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRole } = require('../middleware/auth');
const { getAllMatpel, createMatpel, updateMatpel, deleteMatpel } = require('../controllers/matpelController');

router.get('/', verifyToken, authorizeRole('admin', 'guru'), getAllMatpel);
router.post('/', verifyToken, authorizeRole('admin'), createMatpel);
router.put('/:id', verifyToken, authorizeRole('admin'), updateMatpel);
router.delete('/:id', verifyToken, authorizeRole('admin'), deleteMatpel);

module.exports = router;
