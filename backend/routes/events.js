const r = require('express').Router(), Event = require('../models/Event');
const { auth, soloAdmin } = require('../middleware/auth');
const CAMPOS = ['titulo', 'cat', 'fecha', 'hora', 'lugar', 'dir', 'desc'];

// API externa: Nominatim de OpenStreetMap (dirección -> coordenadas)
async function geocodificar(dir) {
  if (!dir) return {};
  try {
    const url = 'https://nominatim.openstreetmap.org/search?format=json&limit=1&q=' + encodeURIComponent(dir);
    const j = await (await fetch(url, { headers: { 'User-Agent': 'UniEvents/1.0 (proyecto escolar)' } })).json();
    return j[0] ? { lat: +j[0].lat, lng: +j[0].lon } : {};
  } catch { return {}; }
}
const limpiar = b => Object.fromEntries(CAMPOS.filter(c => b[c] !== undefined).map(c => [c, String(b[c])]));

async function buscarDirecciones(q, contexto) {
  if (!q) return [];
  const calle = q.replace(/\b\d+[a-z]?\b/gi, ' ').replace(/\s+/g, ' ').trim();
  const terminos = [calle || q, contexto, /aguascalientes/i.test(q) ? '' : 'Aguascalientes', /m[eé]xico/i.test(q) ? '' : 'México'].filter(Boolean);
  const busqueda = [...new Set(terminos)].join(', ');
  try {
    // Los números de puerta suelen no existir en OSM; buscar la calle permite sugerir un punto cercano.
    const params = new URLSearchParams({ q: busqueda, limit: '8', lang: 'es', lat: '21.8818', lon: '-102.291' });
    const respuesta = await fetch(`https://photon.komoot.io/api/?${params}`, {
      headers: { 'User-Agent': 'UniEvents/1.0 (proyecto escolar)' },
      signal: AbortSignal.timeout(8000)
    });
    if (!respuesta.ok) throw new Error(`Photon respondió con HTTP ${respuesta.status}`);
    const j = await respuesta.json();
    if (!j || !Array.isArray(j.features)) throw new Error('Photon devolvió una respuesta inválida');
    return (j.features || []).map(x => {
      const p = x.properties || {}, [lng, lat] = x.geometry?.coordinates || [];
      const partes = [p.name, p.housenumber, p.street, p.postcode, p.city || p.town || p.village, p.state, p.country];
      const nombre = [...new Set(partes.filter(Boolean))].join(', ');
      return { id: `${p.osm_type || 'place'}-${p.osm_id || nombre}`, nombre, lat: +lat, lng: +lng };
    }).filter(x => x.nombre && Number.isFinite(x.lat) && Number.isFinite(x.lng));
  } catch (error) {
    // Photon puede estar temporalmente fuera de servicio; intenta el geocodificador
    // alternativo de OSM para que la búsqueda siga funcionando.
    try {
      const params = new URLSearchParams({
        q: busqueda,
        format: 'jsonv2',
        limit: '8',
        'accept-language': 'es',
        countrycodes: 'mx',
        viewbox: '-103.5,22.7,-101.0,21.0',
        bounded: '1'
      });
      const respuesta = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
        headers: { 'User-Agent': 'UniEvents/1.0 (proyecto escolar)', 'Accept-Language': 'es' },
        signal: AbortSignal.timeout(8000)
      });
      if (!respuesta.ok) throw new Error(`Nominatim respondió con HTTP ${respuesta.status}`);
      const resultados = await respuesta.json();
      if (!Array.isArray(resultados)) throw new Error('Nominatim devolvió una respuesta inválida');
      return resultados.map(x => ({
        id: `nominatim-${x.place_id}`,
        nombre: x.display_name,
        lat: +x.lat,
        lng: +x.lon
      })).filter(x => x.nombre && Number.isFinite(x.lat) && Number.isFinite(x.lng));
    } catch (fallbackError) {
      const e = new Error(`No se pudo buscar la dirección. Photon: ${error?.message || 'error desconocido'}. Nominatim: ${fallbackError?.message || 'error desconocido'}`);
      e.status = 502;
      throw e;
    }
  }
}
const coordenadas = b => b.lat != null && b.lng != null ? { lat: +b.lat, lng: +b.lng } : null;

r.use(auth);
r.get('/', async (_, res) => res.json(await Event.find().sort({ fecha: 1, hora: 1 })));
r.get('/buscar-direcciones', async (req, res) => {
  try {
    res.json(await buscarDirecciones(String(req.query.q || '').trim(), String(req.query.contexto || '').trim()));
  } catch (e) {
    res.status(e.status || 502).json({ error: e.message || 'No se pudo buscar la dirección' });
  }
});
r.get('/:id', async (req, res) => {
  const e = await Event.findById(req.params.id).catch(() => null);
  if (!e) return res.status(404).json({ error: 'No encontrado' });
  if (e.dir && (e.lat == null || e.lng == null)) {
    const coords = await geocodificar(e.dir);
    if (coords.lat != null && coords.lng != null) {
      e.set(coords);
      await e.save().catch(() => {});
    }
  }
  res.json(e);
});
r.post('/', soloAdmin, async (req, res) => {
  try { res.status(201).json(await Event.create({ ...limpiar(req.body), ...(coordenadas(req.body) || await geocodificar(req.body.dir)) })); }
  catch (e) { res.status(400).json({ error: 'Datos inválidos: ' + e.message }); }
});
r.put('/:id', soloAdmin, async (req, res) => {
  try {
    const e = await Event.findByIdAndUpdate(req.params.id, { ...limpiar(req.body), ...(coordenadas(req.body) || await geocodificar(req.body.dir)) }, { new: true, runValidators: true });
    e ? res.json(e) : res.status(404).json({ error: 'No encontrado' });
  } catch (e) { res.status(400).json({ error: 'Datos inválidos' }); }
});
r.delete('/:id', soloAdmin, async (req, res) => {
  await Event.findByIdAndDelete(req.params.id).catch(() => null);
  res.status(204).end();
});
module.exports = r;
