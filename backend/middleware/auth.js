const jwt = require('jsonwebtoken');
exports.auth = (req, res, next) => {
  const t = (req.headers.authorization || '').replace('Bearer ', '');
  try { req.user = jwt.verify(t, process.env.JWT_SECRET); next(); }
  catch { res.status(401).json({ error: 'Sesión inválida o expirada' }); }
};
exports.soloAdmin = (req, res, next) =>
  req.user?.rol === 'admin' ? next() : res.status(403).json({ error: 'Solo administradores' });
