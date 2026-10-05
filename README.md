# UniEvents

Sistema para la gestión de eventos universitarios.

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