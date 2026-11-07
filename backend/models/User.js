const { Schema, model } = require('mongoose');
module.exports = model('User', new Schema({
  nombre: { type: String, required: true, trim: true },
  correo: { type: String, required: true, unique: true, lowercase: true, trim: true },
  pass: { type: String, required: true },
  rol: { type: String, enum: ['estudiante', 'admin'], default: 'estudiante' }
}, { timestamps: true }));
