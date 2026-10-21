# Integración de una API en UniEvents

**Práctica:** Integración de una API en el proyecto móvil  
**Aplicación:** UniEvents  
**Tecnologías:** Angular, Ionic, Capacitor, Node.js, Express y MongoDB

---

## 1. Descripción del proyecto

UniEvents permite que la comunidad universitaria publique y consulte eventos. Para ayudar a ubicar cada evento, el formulario ofrece sugerencias de direcciones. Al elegir una sugerencia se guardan sus coordenadas, que después se usan para mostrar un mapa en el detalle del evento.

## 2. API externa seleccionada

La búsqueda geográfica utiliza **Photon**, un servicio de búsqueda basado en datos de OpenStreetMap. Si Photon no responde, el backend intenta la búsqueda con **Nominatim**, también de OpenStreetMap. Ninguno requiere una clave de Google.

La app móvil consulta primero la API propia de UniEvents. El backend consulta los proveedores geográficos, normaliza sus respuestas y devuelve únicamente los datos que necesita el frontend. Así el frontend no depende directamente del formato de los proveedores externos.

### Flujo de la integración

1. La persona escribe una dirección en el formulario de un evento.
2. El frontend espera brevemente para evitar enviar una solicitud por cada tecla.
3. El frontend consulta el endpoint autenticado de UniEvents.
4. El backend consulta Photon y usa Nominatim como alternativa si Photon falla.
5. El frontend presenta las sugerencias con su latitud y longitud.
6. Al seleccionar una sugerencia, el formulario conserva las coordenadas y las envía al guardar el evento.
7. El detalle del evento muestra OpenStreetMap si tiene coordenadas. Si solo tiene una dirección, muestra una búsqueda de ubicación en Google Maps.

## 3. Contrato de la solicitud

- **Proveedor principal:** Photon API.
- **Proveedor alternativo:** Nominatim API.
- **Endpoint propio:** `GET /api/events/buscar-direcciones`.
- **Parámetros:** `q` contiene el texto escrito; `contexto` contiene opcionalmente el nombre del lugar.
- **Autenticación:** token JWT en el encabezado `Authorization: Bearer <token>`.
- **Tiempo máximo por proveedor:** 8 segundos.
- **Datos devueltos:** identificador, nombre legible, latitud y longitud.

### Ejemplo de solicitud desde el frontend

```http
GET http://localhost:3000/api/events/buscar-direcciones?q=Universidad%20Politécnica&contexto=Vista%20Alegre
Authorization: Bearer <token>
```

En producción, `localhost:3000` se reemplaza por la URL HTTPS pública del backend. El contexto de la búsqueda se construye con el campo “Lugar”. El backend quita números de puerta de la búsqueda porque esos números no siempre están disponibles en OpenStreetMap, y limita los resultados al área de Aguascalientes.

### Ejemplo de respuesta de UniEvents

```json
[
  {
    "id": "N123456",
    "nombre": "Universidad Politécnica, Aguascalientes, México",
    "lat": 21.8818,
    "lng": -102.291
  }
]
```

Los valores anteriores son ilustrativos. Si la solicitud se completa pero no hay coincidencias, el endpoint responde `200 OK` con una lista vacía (`[]`). Photon entrega GeoJSON; el backend transforma sus coordenadas de `[longitud, latitud]` a los campos `lng` y `lat`. Nominatim se transforma al mismo formato.

## 4. Manejo de errores

- **401:** el token no es válido o la sesión venció; se debe iniciar sesión de nuevo.
- **404:** la ruta solicitada no existe o no se encontró el recurso.
- **502:** Photon y Nominatim no pudieron completar la búsqueda. El backend incluye el detalle disponible de ambos proveedores.
- **Fallo de conexión:** la interfaz indica que no pudo conectarse con la API; se debe comprobar que el backend esté activo y que CORS permita el origen de la app.
- **Sin coincidencias:** no se considera un error; la interfaz invita a probar otra dirección.

## 5. Integración en UniEvents

- `app/src/app/pages/form.page.ts`: espera 650 ms después de cada cambio, consulta el endpoint, muestra sugerencias y conserva latitud/longitud al seleccionar un resultado.
- `backend/routes/events.js`: consulta Photon, usa Nominatim como alternativa, valida las respuestas y devuelve los datos normalizados. Al crear o editar un evento, guarda las coordenadas recibidas.
- `backend/models/Event.js`: define los campos `lat` y `lng` del evento.
- `app/src/app/services/api.service.ts`: centraliza las solicitudes autenticadas de eventos.
- `app/src/app/pages/detalle.page.ts`: muestra un mapa OpenStreetMap con marcador cuando hay coordenadas; si faltan, intenta mostrar la dirección con Google Maps.
- `app/src/environments/environment.ts`: URL local de la API para desarrollo.
- `app/src/environments/environment.prod.ts`: URL pública HTTPS que debe configurarse antes de compilar la app móvil de producción.

## 6. Seguridad y despliegue

El token JWT se envía al backend. Las credenciales de MongoDB y la clave de firma JWT deben quedarse como variables de entorno del backend; nunca deben incluirse en el frontend ni en el APK. Para que la aplicación instalada funcione fuera de la computadora de desarrollo, `environment.prod.ts` debe apuntar a una URL HTTPS pública. El backend publicado también debe permitir el origen de la aplicación Capacitor en su configuración CORS.

## 7. Evidencias de funcionamiento

Agregar capturas reales de la aplicación para documentar cada punto:

1. **Búsqueda:** formulario con sugerencias de dirección visibles.
2. **Selección:** dirección seleccionada y evento guardado.
3. **Mapa:** página de detalle del evento con la ubicación visible.
4. **Manejo de error:** mensaje mostrado cuando los proveedores geográficos no responden.

> Las capturas deben tomarse de una ejecución real; no se incluyen imágenes simuladas en este documento.

## 8. Conclusión

UniEvents integra una búsqueda geográfica de OpenStreetMap en el flujo de creación y edición de eventos. El backend desacopla la aplicación de los formatos externos, ofrece un proveedor alternativo y entrega coordenadas con una estructura uniforme. Esas coordenadas permiten ubicar el evento en su página de detalle. Para compilar la versión móvil, la API debe estar publicada y la URL de producción debe estar configurada.
