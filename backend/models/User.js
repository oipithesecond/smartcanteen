const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  passwordHash: { type: String, required: true },
  role: {
    type: String,
    required: true,
    enum: ['ADMIN', 'OUTLET_MANAGER'],
    default: 'OUTLET_MANAGER'
  },
  assignedDistrict: {
    type: String,
    enum: ['amaravati', 'guntur', 'vijayawada', null],
    default: null
  },
  title: { type: String, default: '' },
  department: { type: String, default: '' },
  avatar: { type: String, default: '' },
  badge: { type: String, default: '' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Instance method: verify password
userSchema.methods.comparePassword = async function (plaintext) {
  return bcrypt.compare(plaintext, this.passwordHash);
};

// Static method: hash a password
userSchema.statics.hashPassword = async function (plaintext) {
  return bcrypt.hash(plaintext, 12);
};

// Safe profile (strip password from API responses)
userSchema.methods.toProfile = function () {
  return {
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    role: this.role,
    assignedDistrict: this.assignedDistrict,
    title: this.title,
    department: this.department,
    avatar: this.avatar,
    badge: this.badge,
    isActive: this.isActive
  };
};

module.exports = mongoose.model('User', userSchema);
