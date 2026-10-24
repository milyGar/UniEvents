# UniEvents

Sistema para la gestión de eventos universitarios.

## Aplicación

El repositorio contiene una aplicación móvil Ionic/Angular en `app/` y una API REST Node.js/Express en `backend/`, con MongoDB como base de datos.

### Ejecución local

1. Configura el backend: entra a `backend/`, ejecuta `npm install`, copia `.env.example` como `.env` y define `MONGODB_URI` y `JWT_SECRET`. Después ejecuta `npm start` (API en `http://localhost:3000`). No agregues `.env` al repositorio.
2. En otra terminal, entra a `app/`, ejecuta `npm install` y `npx ng serve --port 8100`.
3. La app usa `http://localhost:3000/api` como URL del backend de desarrollo.

### Despliegue del backend en Render

1. Crea un servicio web conectado al repositorio y establece `backend` como directorio raíz. Usa `npm install` como comando de build y `npm start` como comando de inicio.
2. Configura `MONGODB_URI`, `JWT_SECRET` y `CORS_ORIGIN` en las variables de entorno del servicio. `CORS_ORIGIN` debe contener los orígenes permitidos separados por comas.
3. Para conectar una app desplegada, cambia `apiUrl` en `app/src/environments/environment.ts` a la URL del servicio seguida de `/api`.
4. Comprueba que la API responde en la URL raíz del servicio; debe devolver `{ "ok": true }`.

### Integración de búsqueda geográfica

El formulario consulta el endpoint autenticado `GET /api/events/buscar-direcciones` del backend. Este realiza una búsqueda de lugares con Photon, basada en OpenStreetMap, normaliza el GeoJSON a sugerencias con `nombre`, `lat` y `lng`, y aplica un timeout de 8 segundos. No se necesita una clave de Google. Si el servicio falla o devuelve datos inválidos, el endpoint responde `502`; una búsqueda válida sin resultados responde `200` con `[]`.

El informe con el request, la estructura de respuesta y los casos de error está en [`docs/integracion-api.md`](docs/integracion-api.md).

## Versionamiento

Se utiliza Git para el historial de cambios y GitHub para almacenar el código y colaborar.

### Repositorio
Nombre del repositorio: `UniEvents`

### Ramas
- `main`: contiene la versión estable del proyecto.
- `feature/*`: se utiliza para desarrollar nuevas funciones.

Ejemplo:
- feature/login
- feature/eventos
- feature/perfil

### Commits
Se realizan al terminar una parte importante del proyecto, con mensajes claros:

- `feat: agregar registro de estudiantes`
- `feat: agregar consulta de eventos`
- `fix: corregir inicio de sesión`
- `docs: actualizar documentación`

### Convenciones
- Los nombres de las ramas serán claros.
- Los commits describirán el cambio realizado.
- Se evitarán mensajes poco descriptivos.
- Antes de integrar cambios se comprobará que la aplicación siga funcionando.

### Estrategia de integración
Cada integrante trabaja en una rama `feature` para desarrollar una función específica.
Cuando la función está terminada, se integra a `main` después de comprobar que funciona correctamente.
De esta manera se mantiene una versión estable del proyecto y un historial de los cambios realizados.
