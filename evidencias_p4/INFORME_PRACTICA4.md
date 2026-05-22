# Informe de Evidencias - Práctica 4: Pruebas de Software
**Proyecto:** Pokedle-IW

A continuación se detalla el conjunto de pruebas realizadas sobre el sistema para validar su calidad, seguridad y rendimiento, tal y como requiere la Práctica 4. Todas las evidencias (capturas y logs) se encuentran adjuntas en el directorio `evidencias_p4/`.

---

## 1. Pruebas de Funcionalidad
Se validó mediante scripts de Playwright el flujo principal de usuario, comprobando el comportamiento esperado tanto en rutas de éxito como en validaciones de error.

- **Evidencia de éxito (`evidencias_p4/funcionalidad_exito.png`)**: Captura que demuestra que el usuario puede cargar correctamente la aplicación y acceder al modo de juego principal. Se verifican elementos esenciales como el input de texto de adivinar Pokémon.
- **Evidencia de error de validación (`evidencias_p4/funcionalidad_error.png`)**: Demuestra el control de errores en los formularios de autenticación al proveer credenciales incompletas o no válidas.

## 2. Pruebas de Base de Datos
Se ejecutaron pruebas teóricas sobre la configuración y restricciones (constraints) de la base de datos Supabase, documentando los resultados que arroja el gestor PostgreSQL ante intentos de violación de integridad.

- **Log de BD (`evidencias_p4/db_error_log.txt`)**: Contiene la salida detallada que devuelve Supabase ante tres casos clave:
  1. Inserción de un campo `NOT NULL` (nombre) con valor nulo.
  2. Violación del constraint `UNIQUE` al intentar duplicar un Pokémon.
  3. Violación del constraint `CHECK` (array vacío en tipos de Pokémon).
  4. Bloqueo RLS de inserción mediante llave anónima de API.

## 3. Pruebas de Compatibilidad
Se empleó el framework Playwright configurado en modo *cross-browser* para simular la renderización y responsividad en distintos dispositivos, motores y resoluciones.

- **Desktop (Chromium 1920x1080)**:
  - `evidencias_p4/compatibilidad_chromium_desktop.png` (Landing)
  - `evidencias_p4/compatibilidad_chromium_desktop_login.png` (Auth)
- **Tablet (Firefox - iPad)**:
  - `evidencias_p4/compatibilidad_firefox_tablet.png` (Landing)
  - `evidencias_p4/compatibilidad_firefox_tablet_login.png` (Auth)
- **Mobile (WebKit - iPhone 14)**:
  - `evidencias_p4/compatibilidad_webkit_movil.png` (Landing)
  - `evidencias_p4/compatibilidad_webkit_movil_login.png` (Auth)
*Estas capturas evidencian que el sistema CSS (TailwindCSS) escala correctamente utilizando una estrategia "mobile-first" adaptándose a cualquier viewport.*

## 4. Pruebas de Rendimiento
Se desarrolló un script de carga que simula múltiples peticiones simultáneas contra el endpoint principal en producción.

- **Reporte de Rendimiento (`evidencias_p4/rendimiento_reporte.txt`)**: Contiene los tiempos de respuesta medidos (TTFB y duración total). Demuestra que la combinación de Vercel Edge Network y Next.js Server Components mantiene los tiempos de respuesta en milisegundos, garantizando un rendimiento óptimo bajo carga.

## 5. Pruebas de Seguridad
Se evaluaron los mecanismos de control de acceso, tanto a nivel de Next.js (middleware) como a nivel de Base de Datos (RLS de Supabase) y rutas de API privadas.

- **Protección de rutas privadas**:
  - `evidencias_p4/seguridad_redireccion_dashboard.png` y `evidencias_p4/seguridad_redireccion_infinito.png`: Verifican que un usuario sin sesión activa (no autenticado) no puede acceder a estas rutas, redirigiéndole automáticamente a `/signin`.
- **Protección de API y Cron**:
  - `evidencias_p4/seguridad_cron_401.txt`: Log que demuestra el bloqueo con `HTTP 401 Unauthorized` al intentar lanzar la actualización de Pokémon sin enviar la cabecera `Authorization` correcta, protegiendo así las operaciones administrativas de ataques maliciosos.
