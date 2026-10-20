const { Schema, model } = require('mongoose');
module.exports = model('Event', new Schema({
  titulo: { type: String, required: true, trim: true, maxlength: 120 },
  cat: { type: String, enum: ['Conferencia', 'Taller', 'Cultural', 'Deportivo', 'Académico'], required: true },
  fecha: { type: String, required: true },
  hora: { type: String, required: true },
  lugar: { type: String, required: true, trim: true },
  dir: { type: String, trim: true },
  desc: { type: String, trim: true, maxlength: 1000 },
  lat: Number, lng: Number
}, { timestamps: true }));
