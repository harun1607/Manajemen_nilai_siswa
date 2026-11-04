// controllers/nilaiController.js
// Controller untuk pengelolaan data nilai siswa

const { Nilai, validasiNilai } = require('../models/Nilai');
const Siswa = require('../models/Siswa');
const Guru  = require('../models/Guru');

// POST input nilai (Guru)
const inputNilai = async (req, res) => {
  try {
    const { siswaId, nilaiTugas, nilaiUTS, nilaiUAS, semester, tahunAjaran } = req.body;
    const guruId = req.user.id;

    // Validasi nilai menggunakan fungsi pemrograman terstruktur
    if (!validasiNilai(nilaiTugas) || !validasiNilai(nilaiUTS) || !validasiNilai(nilaiUAS)) {
      return res.status(400).json({ success: false, message: 'Nilai harus berupa angka antara 0 hingga 100.' });
    }

    // Ambil data guru dari DB (mataPelajaran & kelas sebagai String)
    const guruData = await Guru.findById(guruId);
    if (!guruData) return res.status(404).json({ success: false, message: 'Data guru tidak ditemukan.' });

    const mataPelajaran = guruData.mataPelajaran; // String langsung dari profil guru
    const kelasGuru     = guruData.kelas;          // String langsung dari profil guru

    // Ambil data siswa
    const siswa = await Siswa.findById(siswaId);
    if (!siswa) return res.status(404).json({ success: false, message: 'Siswa tidak ditemukan.' });

    // Validasi: guru hanya bisa input nilai siswa di kelas yang dia ampu
    if (siswa.kelas.trim().toLowerCase() !== kelasGuru.trim().toLowerCase()) {
      return res.status(403).json({
        success: false,
        message: `Anda hanya dapat menginput nilai untuk kelas "${kelasGuru}". Siswa ini ada di kelas "${siswa.kelas}".`,
      });
    }

    // Cek duplikasi nilai
    const existing = await Nilai.findOne({ siswa: siswaId, mataPelajaran, semester, tahunAjaran });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Nilai ${mataPelajaran} untuk ${siswa.nama} pada semester ${semester} sudah ada. Gunakan fitur edit.`,
      });
    }

    const nilai = new Nilai({
      siswa: siswaId,
      guru: guruId,
      mataPelajaran,
      nilaiTugas,
      nilaiUTS,
      nilaiUAS,
      semester,
      tahunAjaran,
    });

    await nilai.save();

    res.status(201).json({
      success: true,
      message: 'Nilai berhasil disimpan.',
      data: {
        siswa: siswa.nama,
        kelas: siswa.kelas,
        mataPelajaran,
        nilaiTugas,
        nilaiUTS,
        nilaiUAS,
        nilaiAkhir: nilai.nilaiAkhir,
        grade: nilai.grade,
        status: nilai.status,
      },
    });
  } catch (err) {
    console.error('Input nilai error:', err);
    res.status(500).json({ success: false, message: 'Gagal menyimpan nilai.' });
  }
};

// PUT update nilai (Guru / Admin)
const updateNilai = async (req, res) => {
  try {
    const { nilaiTugas, nilaiUTS, nilaiUAS } = req.body;

    if (!validasiNilai(nilaiTugas) || !validasiNilai(nilaiUTS) || !validasiNilai(nilaiUAS)) {
      return res.status(400).json({ success: false, message: 'Nilai harus berupa angka antara 0 hingga 100.' });
    }

    const nilai = await Nilai.findById(req.params.id);
    if (!nilai) return res.status(404).json({ success: false, message: 'Data nilai tidak ditemukan.' });

    // Guru hanya bisa edit nilai mata pelajaran yang dia ampu
    if (req.user.role === 'guru') {
      const guruData = await Guru.findById(req.user.id);
      if (guruData.mataPelajaran !== nilai.mataPelajaran) {
        return res.status(403).json({
          success: false,
          message: 'Anda hanya bisa mengedit nilai mata pelajaran yang Anda ampu.',
        });
      }
    }

    nilai.nilaiTugas = nilaiTugas;
    nilai.nilaiUTS   = nilaiUTS;
    nilai.nilaiUAS   = nilaiUAS;
    await nilai.save(); // pre-save hook auto-hitung ulang

    res.json({
      success: true,
      message: 'Nilai berhasil diperbarui.',
      data: { nilaiAkhir: nilai.nilaiAkhir, grade: nilai.grade, status: nilai.status },
    });
  } catch (err) {
    console.error('Update nilai error:', err);
    res.status(500).json({ success: false, message: 'Gagal memperbarui nilai.' });
  }
};

// DELETE nilai (Admin)
const deleteNilai = async (req, res) => {
  try {
    const nilai = await Nilai.findByIdAndDelete(req.params.id);
    if (!nilai) return res.status(404).json({ success: false, message: 'Data nilai tidak ditemukan.' });
    res.json({ success: true, message: 'Data nilai berhasil dihapus.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal menghapus nilai.' });
  }
};

// GET rekap nilai by siswa
const getNilaiBySiswa = async (req, res) => {
  try {
    const { semester, tahunAjaran } = req.query;
    const filter = { siswa: req.params.siswaId };
    if (semester)    filter.semester    = semester;
    if (tahunAjaran) filter.tahunAjaran = tahunAjaran;

    const nilaiList = await Nilai.find(filter)
      .populate('siswa', 'nis nama kelas')
      .populate('guru', 'namaGuru mataPelajaran')
      .sort({ mataPelajaran: 1 });

    res.json({ success: true, data: nilaiList });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal mengambil data nilai.' });
  }
};

// GET nilai siswa sendiri (Siswa)
const getMyNilai = async (req, res) => {
  try {
    const { semester, tahunAjaran } = req.query;
    const filter = { siswa: req.user.id };
    if (semester)    filter.semester    = semester;
    if (tahunAjaran) filter.tahunAjaran = tahunAjaran;

    const nilaiList = await Nilai.find(filter)
      .populate('guru', 'namaGuru mataPelajaran')
      .sort({ mataPelajaran: 1 });

    res.json({ success: true, data: nilaiList });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal mengambil nilai.' });
  }
};

// GET rekap nilai per kelas (Guru/Admin) — laporan
const getLaporanKelas = async (req, res) => {
  try {
    const { kelas, semester, tahunAjaran } = req.query;
    if (!kelas || !semester || !tahunAjaran) {
      return res.status(400).json({ success: false, message: 'Parameter kelas, semester, dan tahunAjaran wajib diisi.' });
    }

    // Jika guru: pastikan kelas yang diminta sesuai kelas yang dia ampu
    if (req.user.role === 'guru') {
      const guruData = await Guru.findById(req.user.id);
      if (guruData && guruData.kelas.trim().toLowerCase() !== kelas.trim().toLowerCase()) {
        return res.status(403).json({
          success: false,
          message: `Anda hanya dapat melihat rekap untuk kelas "${guruData.kelas}".`,
        });
      }
    }

    const siswaList = await Siswa.find({ kelas }).select('nis nama kelas');

    const laporanData = await Promise.all(
      siswaList.map(async (siswa) => {
        const nilaiList = await Nilai.find({ siswa: siswa._id, semester, tahunAjaran })
          .populate('guru', 'namaGuru mataPelajaran');

        // Guru hanya melihat nilai mata pelajaran yang dia ampu
        const filteredNilai = req.user.role === 'guru'
          ? nilaiList.filter((n) => n.mataPelajaran === req.user.mataPelajaran)
          : nilaiList;

        return {
          siswa: { id: siswa._id, nis: siswa.nis, nama: siswa.nama, kelas: siswa.kelas },
          nilai: filteredNilai,
        };
      })
    );

    res.json({ success: true, data: laporanData });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal mengambil laporan.' });
  }
};

// GET semua nilai (Admin)
const getAllNilai = async (req, res) => {
  try {
    const { semester, tahunAjaran, kelas } = req.query;
    let siswaIds = [];

    if (kelas) {
      const siswaList = await Siswa.find({ kelas }).select('_id');
      siswaIds = siswaList.map((s) => s._id);
    }

    const filter = {};
    if (siswaIds.length > 0) filter.siswa = { $in: siswaIds };
    if (semester)    filter.semester    = semester;
    if (tahunAjaran) filter.tahunAjaran = tahunAjaran;

    const nilaiList = await Nilai.find(filter)
      .populate('siswa', 'nis nama kelas')
      .populate('guru', 'namaGuru mataPelajaran')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: nilaiList });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal mengambil semua nilai.' });
  }
};

module.exports = { inputNilai, updateNilai, deleteNilai, getNilaiBySiswa, getMyNilai, getLaporanKelas, getAllNilai };
