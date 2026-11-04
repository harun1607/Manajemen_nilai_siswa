// middleware/auth.js
// Middleware untuk verifikasi JWT dan proteksi route berdasarkan role

const jwt = require('jsonwebtoken');

/**
 * MIDDLEWARE: verifyToken
 * Memverifikasi JWT token dari header Authorization
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer <token>"

  if (!token) {
    return res.status(401).json({ success: false, message: 'Akses ditolak. Token tidak ditemukan.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Token tidak valid atau sudah kadaluarsa.' });
  }
};

/**
 * MIDDLEWARE: authorizeRole
 * Membatasi akses berdasarkan role pengguna
 * @param {...string} roles - Role yang diizinkan (admin, guru, siswa)
 */
const authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Akses ditolak. Role '${req.user.role}' tidak memiliki izin untuk aksi ini.`,
      });
    }
    next();
  };
};

module.exports = { verifyToken, authorizeRole };
