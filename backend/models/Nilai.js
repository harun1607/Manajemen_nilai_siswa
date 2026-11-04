// models/Nilai.js
// OOP: Class Nilai + Pemrograman Terstruktur (fungsi perhitungan)

const mongoose = require('mongoose');

// ============================================================
// PEMROGRAMAN TERSTRUKTUR — FUNGSI/PROSEDUR
// ============================================================

/**
 * FUNGSI 1: Validasi Nilai
 * Memvalidasi bahwa nilai berada dalam rentang 0–100
 * @param {number} nilai - Nilai yang akan divalidasi
 * @returns {boolean} true jika valid, false jika tidak
 */
function validasiNilai(nilai) {
  return typeof nilai === 'number' && nilai >= 0 && nilai <= 100;
}

/**
 * FUNGSI 2: Hitung Nilai Akhir
 * Menghitung nilai akhir berdasarkan bobot:
 *   Tugas 30% + UTS 30% + UAS 40%
 * @param {number} tugas
 * @param {number} uts
 * @param {number} uas
 * @returns {number} nilai akhir (dibulatkan 2 desimal)
 */
function hitungNilaiAkhir(tugas, uts, uas) {
  const nilaiAkhir = 0.3 * tugas + 0.3 * uts + 0.4 * uas;
  return Math.round(nilaiAkhir * 100) / 100;
}

/**
 * FUNGSI 3: Tentukan Status Kelulusan
 * Siswa lulus jika nilai akhir >= 70
 * @param {number} nilaiAkhir
 * @returns {string} 'Lulus' atau 'Tidak Lulus'
 */
function tentukanStatus(nilaiAkhir) {
  return nilaiAkhir >= 70 ? 'Lulus' : 'Tidak Lulus';
}

/**
 * FUNGSI 4: Tentukan Grade Nilai
 * @param {number} nilaiAkhir
 * @returns {string} Grade A/B/C/D/E
 */
function tentukanGrade(nilaiAkhir) {
  if (nilaiAkhir >= 90) return 'A';
  if (nilaiAkhir >= 80) return 'B';
  if (nilaiAkhir >= 70) return 'C';
  if (nilaiAkhir >= 60) return 'D';
  return 'E';
}

// ============================================================
// OOP: CLASS Nilai (Mongoose Schema)
// ============================================================

/**
 * CLASS: Nilai
 * Merepresentasikan entitas Nilai siswa per mata pelajaran
 * Atribut: siswa, guru, mataPelajaran, nilaiTugas, nilaiUTS, nilaiUAS,
 *          nilaiAkhir, grade, status
 */
const NilaiSchema = new mongoose.Schema(
  {
    siswa: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Siswa',
      required: [true, 'Data siswa wajib diisi'],
    },
    guru: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Guru',
      required: [true, 'Data guru wajib diisi'],
    },
    mataPelajaran: {
      type: String,
      required: [true, 'Mata pelajaran wajib diisi'],
      trim: true,
    },
    nilaiTugas: {
      type: Number,
      required: [true, 'Nilai tugas wajib diisi'],
      min: [0, 'Nilai minimal 0'],
      max: [100, 'Nilai maksimal 100'],
    },
    nilaiUTS: {
      type: Number,
      required: [true, 'Nilai UTS wajib diisi'],
      min: [0, 'Nilai minimal 0'],
      max: [100, 'Nilai maksimal 100'],
    },
    nilaiUAS: {
      type: Number,
      required: [true, 'Nilai UAS wajib diisi'],
      min: [0, 'Nilai minimal 0'],
      max: [100, 'Nilai maksimal 100'],
    },
    nilaiAkhir: {
      type: Number,
    },
    grade: {
      type: String,
      enum: ['A', 'B', 'C', 'D', 'E'],
    },
    status: {
      type: String,
      enum: ['Lulus', 'Tidak Lulus'],
    },
    semester: {
      type: String,
      required: [true, 'Semester wajib diisi'],
      trim: true,
    },
    tahunAjaran: {
      type: String,
      required: [true, 'Tahun ajaran wajib diisi'],
      trim: true,
    },
  },
  { timestamps: true }
);

// Satu siswa hanya bisa punya satu nilai per matpel per semester per tahun ajaran
NilaiSchema.index(
  { siswa: 1, mataPelajaran: 1, semester: 1, tahunAjaran: 1 },
  { unique: true }
);

// METHOD: Auto-hitung nilaiAkhir, grade, status sebelum disimpan
// Menggunakan fungsi-fungsi pemrograman terstruktur di atas
NilaiSchema.pre('save', function (next) {
  // Validasi semua nilai
  if (
    !validasiNilai(this.nilaiTugas) ||
    !validasiNilai(this.nilaiUTS) ||
    !validasiNilai(this.nilaiUAS)
  ) {
    return next(new Error('Nilai harus berada dalam rentang 0–100'));
  }

  // Hitung dan simpan nilai akhir, grade, status
  this.nilaiAkhir = hitungNilaiAkhir(this.nilaiTugas, this.nilaiUTS, this.nilaiUAS);
  this.grade = tentukanGrade(this.nilaiAkhir);
  this.status = tentukanStatus(this.nilaiAkhir);

  next();
});

// Ekspor fungsi agar bisa digunakan di controller (pemrograman terstruktur)
module.exports = {
  Nilai: mongoose.model('Nilai', NilaiSchema),
  validasiNilai,
  hitungNilaiAkhir,
  tentukanStatus,
  tentukanGrade,
};
