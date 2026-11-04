// controllers/siswaController.js
// Controller untuk pengelolaan data siswa

const Siswa = require('../models/Siswa');
const { Nilai } = require('../models/Nilai');

// GET semua siswa (Admin)
const getAllSiswa = async (req, res) => {
  try {
    const siswaList = await Siswa.find().select('-password').sort({ kelas: 1, nama: 1 });
    res.json({ success: true, data: siswaList });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal mengambil data siswa.' });
  }
};

// GET siswa by ID (Admin)
const getSiswaById = async (req, res) => {
  try {
    const siswa = await Siswa.findById(req.params.id).select('-password');
    if (!siswa) return res.status(404).json({ success: false, message: 'Siswa tidak ditemukan.' });
    res.json({ success: true, data: siswa });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal mengambil data siswa.' });
  }
};

// POST tambah siswa (Admin)
const createSiswa = async (req, res) => {
  try {
    const { nis, nama, kelas, password } = req.body;

    if (!nis || !nama || !kelas || !password) {
      return res.status(400).json({ success: false, message: 'Semua field wajib diisi.' });
    }

    const existing = await Siswa.findOne({ nis });
    if (existing) return res.status(409).json({ success: false, message: `NIS ${nis} sudah terdaftar.` });

    const siswa = new Siswa({ nis, nama, kelas, password });
    await siswa.save();

    res.status(201).json({
      success: true,
      message: 'Siswa berhasil ditambahkan.',
      data: { nis: siswa.nis, nama: siswa.nama, kelas: siswa.kelas },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal menambahkan siswa.' });
  }
};

// PUT update siswa (Admin)
const updateSiswa = async (req, res) => {
  try {
    const { nama, kelas, password } = req.body;
    const updateData = {};
    if (nama) updateData.nama = nama;
    if (kelas) updateData.kelas = kelas;

    const siswa = await Siswa.findById(req.params.id);
    if (!siswa) return res.status(404).json({ success: false, message: 'Siswa tidak ditemukan.' });

    if (nama) siswa.nama = nama;
    if (kelas) siswa.kelas = kelas;
    if (password) siswa.password = password; // akan di-hash oleh pre-save hook

    await siswa.save();
    res.json({ success: true, message: 'Data siswa berhasil diperbarui.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal memperbarui data siswa.' });
  }
};

// DELETE hapus siswa (Admin)
const deleteSiswa = async (req, res) => {
  try {
    const siswa = await Siswa.findByIdAndDelete(req.params.id);
    if (!siswa) return res.status(404).json({ success: false, message: 'Siswa tidak ditemukan.' });

    // Hapus juga data nilai siswa
    await Nilai.deleteMany({ siswa: req.params.id });

    res.json({ success: true, message: 'Siswa dan seluruh data nilainya berhasil dihapus.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal menghapus siswa.' });
  }
};

// GET profil siswa sendiri (Siswa)
const getMyProfile = async (req, res) => {
  try {
    const siswa = await Siswa.findById(req.user.id).select('-password');
    if (!siswa) return res.status(404).json({ success: false, message: 'Data tidak ditemukan.' });
    res.json({ success: true, data: siswa });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal mengambil profil.' });
  }
};

module.exports = { getAllSiswa, getSiswaById, createSiswa, updateSiswa, deleteSiswa, getMyProfile };
