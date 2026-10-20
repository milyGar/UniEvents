const r = require('express').Router(), bcrypt = require('bcryptjs'), jwt = require('jsonwebtoken');
const User = require('../models/User');
const firmar = u => jwt.sign({ id: u._id, rol: u.rol }, process.env.JWT_SECRET, { expiresIn: '12h' });
const salida = u => ({ token: firmar(u), user: { nombre: u.nombre, correo: u.correo, rol: u.rol } });

r.post('/register', async (req, res) => {
  const { nombre, correo, pass } = req.body || {};
  if (!nombre?.trim() || !/^\S+@\S+\.\S+$/.test(correo || '') || (pass || '').length < 6)
    return res.status(400).json({ error: 'Datos inválidos (contraseña mínimo 6 caracteres)' });
  if (await User.findOne({ correo: correo.toLowerCase() })) return res.status(409).json({ error: 'Correo ya registrado' });
  const u = await User.create({ nombre, correo, pass: await bcrypt.hash(pass, 10), rol: 'estudiante' });
  res.status(201).json(salida(u));
});
r.post('/login', async (req, res) => {
  const { correo, pass } = req.body || {};
  const u = await User.findOne({ correo: String(correo || '').toLowerCase() });
  if (!u || !(await bcrypt.compare(String(pass || ''), u.pass))) return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
  res.json(salida(u));
});
module.exports = r;
