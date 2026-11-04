// controllers/guruController.js

const Guru = require('../models/Guru');

// GET semua guru (Admin)
const getAllGuru = async (req, res) => {
  try {
    const guruList = await Guru.find().select('-password').sort({ namaGuru: 1 });
    res.json({ success: true, data: guruList });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal mengambil data guru.' });
  }
};

// GET guru by ID
const getGuruById = async (req, res) => {
  try {
    const guru = await Guru.findById(req.params.id).select('-password');
    if (!guru) return res.status(404).json({ success: false, message: 'Guru tidak ditemukan.' });
    res.json({ success: true, data: guru });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal mengambil data guru.' });
  }
};

// POST tambah guru (Admin)
const createGuru = async (req, res) => {
  try {
    const { idGuru, namaGuru, mataPelajaran, kelas, password } = req.body;

    // Validasi field wajib
    if (!idGuru || !namaGuru || !mataPelajaran || !kelas || !password) {
      return res.status(400).json({
        success: false,
        message: 'Semua field wajib diisi (ID Guru, Nama, Mata Pelajaran, Kelas, Password).',
      });
    }

    // Validasi panjang password
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password minimal 6 karakter.' });
    }

    // Validasi mataPelajaran tidak kosong
    if (!mataPelajaran.trim()) {
      return res.status(400).json({ success: false, message: 'Mata pelajaran wajib diisi.' });
    }

    // Validasi kelas tidak kosong
    if (!kelas.trim()) {
      return res.status(400).json({ success: false, message: 'Kelas wajib diisi.' });
    }

    // Cek duplikat ID Guru
    const existing = await Guru.findOne({ idGuru: idGuru.toUpperCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: `ID Guru "${idGuru}" sudah terdaftar.` });
    }

    const guru = new Guru({
      idGuru,
      namaGuru,
      mataPelajaran: mataPelajaran.trim(),
      kelas: kelas.trim(),
      password,
    });
    await guru.save();

    res.status(201).json({
      success: true,
      message: `Guru "${namaGuru}" berhasil ditambahkan.`,
      data: guru.getProfile(),
    });
  } catch (err) {
    console.error('createGuru error:', err);
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'ID Guru sudah terdaftar.' });
    }
    res.status(500).json({ success: false, message: `Gagal menambahkan guru: ${err.message}` });
  }
};

// PUT update guru (Admin)
const updateGuru = async (req, res) => {
  try {
    const { namaGuru, mataPelajaran, kelas, password } = req.body;
    const guru = await Guru.findById(req.params.id);
    if (!guru) return res.status(404).json({ success: false, message: 'Guru tidak ditemukan.' });

    if (namaGuru) guru.namaGuru = namaGuru;
    if (mataPelajaran && mataPelajaran.trim()) guru.mataPelajaran = mataPelajaran.trim();
    if (kelas && kelas.trim()) guru.kelas = kelas.trim();
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ success: false, message: 'Password minimal 6 karakter.' });
      }
      guru.password = password;
    }

    await guru.save();
    res.json({ success: true, message: 'Data guru berhasil diperbarui.' });
  } catch (err) {
    console.error('updateGuru error:', err);
    res.status(500).json({ success: false, message: `Gagal memperbarui data guru: ${err.message}` });
  }
};

// DELETE hapus guru (Admin)
const deleteGuru = async (req, res) => {
  try {
    const guru = await Guru.findByIdAndDelete(req.params.id);
    if (!guru) return res.status(404).json({ success: false, message: 'Guru tidak ditemukan.' });
    res.json({ success: true, message: `Guru "${guru.namaGuru}" berhasil dihapus.` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal menghapus guru.' });
  }
};

// GET profil guru sendiri (Guru)
const getMyProfile = async (req, res) => {
  try {
    const guru = await Guru.findById(req.user.id).select('-password');
    if (!guru) return res.status(404).json({ success: false, message: 'Data tidak ditemukan.' });
    res.json({ success: true, data: guru });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal mengambil profil.' });
  }
};

module.exports = { getAllGuru, getGuruById, createGuru, updateGuru, deleteGuru, getMyProfile };
