// controllers/matpelController.js

const MataPelajaran = require('../models/MataPelajaran');

// GET semua mata pelajaran (Admin, Guru)
const getAllMatpel = async (req, res) => {
  try {
    const list = await MataPelajaran.find().sort({ nama: 1 });
    res.json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal mengambil data mata pelajaran.' });
  }
};

// POST tambah mata pelajaran (Admin)
const createMatpel = async (req, res) => {
  try {
    const { kode, nama, deskripsi } = req.body;
    if (!kode || !nama) {
      return res.status(400).json({ success: false, message: 'Kode dan nama mata pelajaran wajib diisi.' });
    }
    const existing = await MataPelajaran.findOne({ kode: kode.toUpperCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: `Kode mata pelajaran ${kode} sudah terdaftar.` });
    }
    const matpel = new MataPelajaran({ kode, nama, deskripsi });
    await matpel.save();
    res.status(201).json({ success: true, message: 'Mata pelajaran berhasil ditambahkan.', data: matpel });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal menambahkan mata pelajaran.' });
  }
};

// PUT update mata pelajaran (Admin)
const updateMatpel = async (req, res) => {
  try {
    const { nama, deskripsi } = req.body;
    const matpel = await MataPelajaran.findById(req.params.id);
    if (!matpel) return res.status(404).json({ success: false, message: 'Mata pelajaran tidak ditemukan.' });
    if (nama) matpel.nama = nama;
    if (deskripsi !== undefined) matpel.deskripsi = deskripsi;
    await matpel.save();
    res.json({ success: true, message: 'Mata pelajaran berhasil diperbarui.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal memperbarui mata pelajaran.' });
  }
};

// DELETE mata pelajaran (Admin)
const deleteMatpel = async (req, res) => {
  try {
    const matpel = await MataPelajaran.findByIdAndDelete(req.params.id);
    if (!matpel) return res.status(404).json({ success: false, message: 'Mata pelajaran tidak ditemukan.' });
    res.json({ success: true, message: 'Mata pelajaran berhasil dihapus.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal menghapus mata pelajaran.' });
  }
};

module.exports = { getAllMatpel, createMatpel, updateMatpel, deleteMatpel };
