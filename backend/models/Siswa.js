// models/Siswa.js
// OOP: Class Siswa merepresentasikan data siswa dalam sistem

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * CLASS: Siswa
 * Merepresentasikan entitas Siswa dalam sistem
 * Atribut: nis, nama, kelas, password, role
 */
const SiswaSchema = new mongoose.Schema(
  {
    nis: {
      type: String,
      required: [true, 'NIS wajib diisi'],
      unique: true,
      trim: true,
    },
    nama: {
      type: String,
      required: [true, 'Nama wajib diisi'],
      trim: true,
    },
    kelas: {
      type: String,
      required: [true, 'Kelas wajib diisi'],
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password wajib diisi'],
      minlength: 6,
    },
    role: {
      type: String,
      default: 'siswa',
      enum: ['siswa'],
    },
  },
  { timestamps: true }
);

// METHOD: Hash password sebelum disimpan
SiswaSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// METHOD: Verifikasi password
SiswaSchema.methods.verifyPassword = async function (inputPassword) {
  return await bcrypt.compare(inputPassword, this.password);
};

// METHOD: Mendapatkan info ringkas siswa
SiswaSchema.methods.getProfile = function () {
  return {
    nis: this.nis,
    nama: this.nama,
    kelas: this.kelas,
    role: this.role,
  };
};

module.exports = mongoose.model('Siswa', SiswaSchema);
