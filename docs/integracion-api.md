# Integración de una API en UniEvents

## Proyecto y problema

UniEvents ayuda a la comunidad universitaria a publicar y encontrar eventos. Las direcciones escritas pueden ser difíciles de interpretar y no son suficientes para fijar con precisión el lugar del evento en el mapa.

## API seleccionada y justificación

La aplicación usa **Photon**, servicio de búsqueda geográfica basado en OpenStreetMap, para sugerir lugares mientras se captura la dirección. La búsqueda forma parte del flujo real de creación y edición de eventos: la persona elige una sugerencia y la aplicación guarda su nombre y coordenadas para mostrar el mapa del evento.

Photon se consulta desde el backend para no depender de una clave de Google ni exponer servicios de terceros directamente desde la app móvil. La geocodificación de respaldo del backend usa Nominatim de OpenStreetMap.

## Contrato de la solicitud

- **Servicio:** Photon API
- **URL base:** `https://photon.komoot.io/api/`
- **Endpoint usado:** `GET /api/events/buscar-direcciones?q=<texto>&contexto=<lugar>` en la API de UniEvents. El backend consulta Photon con `q`, `limit=8`, `lang=es` y una ubicación de referencia en Aguascalientes.
- **Método HTTP:** `GET`
- **Autenticación:** token JWT de UniEvents en `Authorization: Bearer <token>` para el endpoint de UniEvents. Photon no requiere clave de API.
- **Header de Photon:** `User-Agent: UniEvents/1.0 (proyecto escolar)`.
- **Tiempo máximo:** 8 segundos.

### Request

La app llama al endpoint propio con una dirección parcial y, si se conoce, el nombre del lugar:

```http
GET http://localhost:3000/api/events/buscar-direcciones?q=Universidad%20Tecnol%C3%B3gica&contexto=UTA
Authorization: Bearer <token>
```

El backend construye la consulta a Photon y elimina números de puerta antes de buscar, porque esos números no siempre están disponibles en OpenStreetMap.

### Response de UniEvents

Con coincidencias, la app recibe una lista normalizada. Este ejemplo ilustra la estructura; los valores dependen del resultado real de Photon:

```json
[
  {
    "id": "N123456",
    "nombre": "Universidad Tecnológica, Aguascalientes, México",
    "lat": 21.8818,
    "lng": -102.291
  }
]
```

Si la búsqueda tuvo éxito, pero no hubo coincidencias, responde `200 OK` y `[]`. En la app, cada elemento se muestra como sugerencia seleccionable. Al elegirlo, sus coordenadas se guardan con el evento y se utilizan en el mapa OpenStreetMap.

La respuesta original de Photon es GeoJSON. El backend usa `features`, `properties` y `geometry.coordinates` (`[longitud, latitud]`) para producir los objetos anteriores.

### Errores contemplados

- `401`: sesión de UniEvents inválida o expirada.
- `404`: ruta o evento inexistente.
- `502`: Photon no respondió correctamente, devolvió datos no válidos o excedió los 8 segundos.
- Error de conexión entre app y backend: la interfaz informa que no pudo conectarse y pide comprobar el backend y CORS.
- JSON inválido: se trata como error del servicio; una lista vacía se reserva para una búsqueda válida sin coincidencias.

## Implementación en el proyecto

- `app/src/app/pages/form.page.ts`: envía la consulta con debounce, muestra el estado de búsqueda y las sugerencias, y guarda latitud/longitud al seleccionar una.
- `backend/routes/events.js`: valida y normaliza los resultados de Photon; informa los errores del servicio con HTTP `502`. También usa Nominatim para geocodificación de respaldo.
- `app/src/app/pages/detalle.page.ts`: presenta el mapa embebido de OpenStreetMap cuando el evento tiene coordenadas.
- `app/src/app/services/api.service.ts`: concentra las solicitudes autenticadas de eventos de UniEvents.

## Evidencia de funcionamiento

Para completar las evidencias visuales solicitadas por la práctica, captura en el navegador o emulador:

1. El formulario mientras aparecen sugerencias de dirección.
2. Una sugerencia seleccionada y el evento guardado.
3. El detalle del evento con el mapa OpenStreetMap.
4. Un caso sin resultados o con el servicio desconectado y el mensaje visible.

## Conclusión

La búsqueda geográfica está integrada al flujo existente de UniEvents y convierte una dirección parcial en una sugerencia seleccionable con coordenadas. El manejo explícito de HTTP fallido, JSON inválido y timeout permite distinguir problemas del servicio de una búsqueda válida sin resultados. Esta solución usa OpenStreetMap y no requiere clave de Google.
