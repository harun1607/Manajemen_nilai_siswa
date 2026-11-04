// models/Guru.js
// OOP: Class Guru merepresentasikan data guru dalam sistem

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * CLASS: Guru
 * Merepresentasikan entitas Guru dalam sistem
 * Atribut: idGuru, namaGuru, mataPelajaran (String), kelas (String), password, role
 */
const GuruSchema = new mongoose.Schema(
  {
    idGuru: {
      type: String,
      required: [true, 'ID Guru wajib diisi'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    namaGuru: {
      type: String,
      required: [true, 'Nama Guru wajib diisi'],
      trim: true,
    },
    mataPelajaran: {
      type: String,
      required: [true, 'Mata Pelajaran wajib diisi'],
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
      default: 'guru',
      enum: ['guru'],
    },
  },
  { timestamps: true }
);

// METHOD: Hash password sebelum disimpan
GuruSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// METHOD: Verifikasi password
GuruSchema.methods.verifyPassword = async function (inputPassword) {
  return await bcrypt.compare(inputPassword, this.password);
};

// METHOD: Mendapatkan info ringkas guru
GuruSchema.methods.getProfile = function () {
  return {
    idGuru: this.idGuru,
    namaGuru: this.namaGuru,
    mataPelajaran: this.mataPelajaran,
    kelas: this.kelas,
    role: this.role,
  };
};

module.exports = mongoose.model('Guru', GuruSchema);
