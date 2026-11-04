// controllers/authController.js
// Controller untuk proses autentikasi semua role

const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Guru = require('../models/Guru');
const Siswa = require('../models/Siswa');

/**
 * FUNGSI: generateToken
 * Membuat JWT token dengan payload user
 * Pemrograman Terstruktur — fungsi helper
 */
function generateToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });
}

/**
 * POST /api/auth/login
 * Login untuk semua role (admin, guru, siswa)
 * Body: { identifier, password, role }
 *   - admin  -> identifier = username
 *   - guru   -> identifier = idGuru
 *   - siswa  -> identifier = nis
 */
const login = async (req, res) => {
  try {
    const { identifier, password, role } = req.body;

    if (!identifier || !password || !role) {
      return res.status(400).json({ success: false, message: 'Identifier, password, dan role wajib diisi.' });
    }

    let user = null;
    let tokenPayload = {};

    if (role === 'admin') {
      user = await Admin.findOne({ username: identifier });
      if (!user) return res.status(401).json({ success: false, message: 'Username atau password salah.' });
      const valid = await user.verifyPassword(password);
      if (!valid) return res.status(401).json({ success: false, message: 'Username atau password salah.' });
      tokenPayload = { id: user._id, nama: user.nama, role: 'admin' };

    } else if (role === 'guru') {
      user = await Guru.findOne({ idGuru: identifier.toUpperCase() });
      if (!user) return res.status(401).json({ success: false, message: 'ID Guru atau password salah.' });
      const valid = await user.verifyPassword(password);
      if (!valid) return res.status(401).json({ success: false, message: 'ID Guru atau password salah.' });
      tokenPayload = { id: user._id, nama: user.namaGuru, idGuru: user.idGuru, mataPelajaran: user.mataPelajaran, kelas: user.kelas, role: 'guru' };

    } else if (role === 'siswa') {
      user = await Siswa.findOne({ nis: identifier });
      if (!user) return res.status(401).json({ success: false, message: 'NIS atau password salah.' });
      const valid = await user.verifyPassword(password);
      if (!valid) return res.status(401).json({ success: false, message: 'NIS atau password salah.' });
      tokenPayload = { id: user._id, nama: user.nama, nis: user.nis, kelas: user.kelas, role: 'siswa' };

    } else {
      return res.status(400).json({ success: false, message: 'Role tidak valid.' });
    }

    const token = generateToken(tokenPayload);

    return res.status(200).json({
      success: true,
      message: `Login berhasil sebagai ${role}.`,
      token,
      user: tokenPayload,
    });

  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

module.exports = { login };
