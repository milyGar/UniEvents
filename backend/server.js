require('dotenv').config();
const express = require('express'), mongoose = require('mongoose'), cors = require('cors');
const helmet = require('helmet'), rateLimit = require('express-rate-limit');
const app = express();
app.use(helmet(), cors({ origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : false }), express.json({ limit: '50kb' }));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 50 }), require('./routes/auth'));
app.use('/api/events', require('./routes/events'));
app.get('/', (_, res) => res.json({ ok: true }));
mongoose.connect(process.env.MONGODB_URI)
  .then(() => app.listen(process.env.PORT || 3000, () => console.log('API lista')))
  .catch(e => { console.error('Error de BD:', e.message); process.exit(1); });
