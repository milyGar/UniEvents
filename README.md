# UniEvents

UniEvents es una aplicación web móvil para consultar eventos universitarios. Los administradores pueden crear, modificar y eliminar eventos; los estudiantes pueden registrarse, iniciar sesión, buscar eventos y consultar sus detalles y ubicación.

## Requisitos

- Node.js 22.x y npm.
- Una base de datos MongoDB accesible desde el backend. Para desplegar, puede usarse MongoDB Atlas.
- GitHub para conectar el repositorio con Render.

## Tecnologías

- Ionic y Angular 22 para la interfaz.
- Capacitor 8 para preparar la aplicación móvil.
- Node.js y Express para la API REST.
- MongoDB y Mongoose para guardar usuarios y eventos.
- JWT y bcryptjs para autenticación y contraseñas.
- Photon y Nominatim para sugerencias/geocodificación de direcciones; OpenStreetMap para mostrar mapas.

## Carpetas principales

- `app/`: aplicación Ionic/Angular.
- `backend/`: API REST, modelos, autenticación y operaciones de eventos.

## Instalación y ejecución local

### 1. Configurar y ejecutar la API

Abre una terminal en la carpeta del proyecto:

```powershell
cd backend
npm install
Copy-Item .env.example .env
```

Edita `backend/.env` y configura:

- `MONGODB_URI`: cadena de conexión de MongoDB.
- `JWT_SECRET`: clave larga y privada para firmar sesiones.
- `CORS_ORIGIN`: origen permitido de la aplicación; localmente, `http://localhost:8100`.
- `ADMIN_EMAIL` y `ADMIN_PASS`: credenciales para crear la cuenta administradora.

Después ejecuta:

```powershell
npm run seed
npm start
```

La API escucha en `http://localhost:3000`. La ruta `/` responde `{"ok":true}`; las rutas de la API comienzan con `/api`.

### 2. Ejecutar la aplicación

Abre otra terminal:

```powershell
cd app
npm ci
npm start -- --port 8100
```

Abre `http://localhost:8100` en el navegador. En desarrollo, la aplicación consulta la API en `http://localhost:3000/api`.

## Despliegue en Render

El repositorio contiene dos servicios y se despliegan por separado:

### API (Web Service)

- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `npm start`
- Variables de entorno: `MONGODB_URI`, `JWT_SECRET`, `CORS_ORIGIN`, `ADMIN_EMAIL` y `ADMIN_PASS`.

Render asigna una URL HTTPS al servicio. La base de datos debe aceptar conexiones desde el servicio desplegado.

### Aplicación (Static Site)

- Root Directory: `app`
- Build Command: `npm ci && npm run build`
- Publish Directory: `www`
- Rewrite: `/*` a `/index.html`, con acción **Rewrite**, para que funcionen las rutas de Angular al abrir un evento directamente.

Antes de compilar producción, sustituye el valor de `apiUrl` en `app/src/environments/environment.prod.ts` por la URL HTTPS del backend seguida de `/api`. Configura `CORS_ORIGIN` en el servicio API con el dominio HTTPS de la aplicación.

No subas `.env`, contraseñas, tokens ni cadenas de conexión al repositorio. Guarda esas variables en la configuración de Render.
