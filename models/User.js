const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String, required: true }, // No hashing
  createdAt: { type: Date, default: Date.now }
});

// Method to compare passwords (without hashing)
userSchema.methods.verifyPassword = function (providedPassword) {
  return this.password === providedPassword; // Direct comparison
};

module.exports = mongoose.model('User', userSchema);
