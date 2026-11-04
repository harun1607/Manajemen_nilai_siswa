// models/MataPelajaran.js
// OOP: Class MataPelajaran merepresentasikan data mata pelajaran dalam sistem

const mongoose = require('mongoose');

/**
 * CLASS: MataPelajaran
 * Atribut: kode, nama, deskripsi
 */
const MataPelajaranSchema = new mongoose.Schema(
  {
    kode: {
      type: String,
      required: [true, 'Kode mata pelajaran wajib diisi'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    nama: {
      type: String,
      required: [true, 'Nama mata pelajaran wajib diisi'],
      trim: true,
    },
    deskripsi: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MataPelajaran', MataPelajaranSchema);
