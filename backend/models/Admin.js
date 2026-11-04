// models/Admin.js
// OOP: Class Admin merepresentasikan data administrator sistem

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * CLASS: Admin
 * Merepresentasikan entitas Admin dalam sistem
 * Atribut: username, password, nama, role
 */
const AdminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username wajib diisi'],
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password wajib diisi'],
      minlength: 6,
    },
    nama: {
      type: String,
      required: [true, 'Nama wajib diisi'],
      trim: true,
    },
    role: {
      type: String,
      default: 'admin',
      enum: ['admin'],
    },
  },
  { timestamps: true }
);

// METHOD: Hash password sebelum disimpan
AdminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// METHOD: Verifikasi password
AdminSchema.methods.verifyPassword = async function (inputPassword) {
  return await bcrypt.compare(inputPassword, this.password);
};

module.exports = mongoose.model('Admin', AdminSchema);
