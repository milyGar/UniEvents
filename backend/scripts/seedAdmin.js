require('dotenv').config();
const mongoose = require('mongoose'), bcrypt = require('bcryptjs'), User = require('../models/User');
(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const correo = process.env.ADMIN_EMAIL.toLowerCase();
  await User.updateOne({ correo }, { nombre: 'Administrador', correo, pass: await bcrypt.hash(process.env.ADMIN_PASS, 10), rol: 'admin' }, { upsert: true });
  console.log('Admin listo:', correo); process.exit(0);
})();
