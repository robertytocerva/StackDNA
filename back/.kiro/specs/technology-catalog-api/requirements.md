# Documento de Requisitos

## Introducción

Technology Catalog API es una plataforma backend para descubrir APIs, frameworks y bibliotecas de software. El sistema agrega información de múltiples fuentes públicas externas (APIs.guru, npm Registry, PyPI, GitHub), almacena los datos localmente en PostgreSQL y expone endpoints REST públicos para búsqueda avanzada y consulta de fichas detalladas de cada tecnología. Todos los endpoints son públicos — no existe autenticación ni sistema de usuarios en esta versión (v1.0).

El stack tecnológico es Node.js + Express con TypeScript, PostgreSQL como base de datos, migraciones versionadas SQL/TS y arquitectura limpia por capas (controllers, services, repositories, routes, config).

## Glosario

- **Sistema_API**: El servidor backend Express/TypeScript que expone los endpoints REST públicos.
- **Conector_Externo**: Módulo HTTP reutilizable que consulta una fuente de datos externa específica (APIs.guru, npm, PyPI, GitHub).
- **Catálogo**: Tabla principal en PostgreSQL que almacena las tecnologías normalizadas provenientes de fuentes externas.
- **Tecnología**: Registro individual que representa una API, framework o biblioteca con sus metadatos asociados.
- **Ficha_Detalle**: Respuesta enriquecida de un endpoint que incluye resumen estructurado, métricas dinámicas y ejemplo de uso.
- **Caché_Local**: Almacenamiento en PostgreSQL de respuestas de APIs externas para reducir consultas redundantes y respetar rate limits.
- **Script_Seeding**: Proceso batch que consulta las fuentes externas y puebla la base de datos con un conjunto representativo inicial de tecnologías.
- **Migración**: Archivo SQL/TS versionado que define cambios incrementales en el esquema de la base de datos, registrado en una tabla de historial.
- **Rate_Limiter**: Mecanismo interno del Conector_Externo que controla la frecuencia de peticiones a APIs externas para no exceder sus límites.
- **Slug**: Identificador URL-friendly único generado a partir del nombre de la Tecnología.

## Requisitos

### Requisito 1: Estructura del Proyecto e Infraestructura Base

**Historia de Usuario:** Como desarrollador del equipo, quiero una estructura de proyecto Node.js/TypeScript configurada con arquitectura limpia por capas, para que el desarrollo siga convenciones claras desde el inicio.

#### Criterios de Aceptación

1. THE Sistema_API SHALL organizar el código fuente en las capas src/controllers, src/services, src/repositories, src/routes y src/config, donde cada capa contiene al menos un archivo index.ts que exporta los módulos de esa capa.
2. THE Sistema_API SHALL incluir un archivo package.json con las dependencias necesarias para Express, TypeScript, pg (cliente PostgreSQL) y dotenv, especificando versiones exactas (pinned) para cada dependencia.
3. THE Sistema_API SHALL incluir un archivo tsconfig.json con configuración estricta de TypeScript (strict mode habilitado, target ES2020 o superior, y module configurado para compatibilidad con Node.js).
4. WHEN la aplicación inicia, THE Sistema_API SHALL cargar variables de entorno desde un archivo .env utilizando dotenv antes de inicializar cualquier otro módulo o conexión.
5. IF el archivo .env no existe o una variable de entorno requerida no está definida, THEN THE Sistema_API SHALL terminar el proceso con código de salida 1 y un mensaje de error en stderr indicando el nombre de cada variable faltante.
6. THE Sistema_API SHALL definir como variables de entorno requeridas al menos: PORT, DATABASE_URL (o equivalentes HOST, PORT, USER, PASSWORD, DB_NAME para PostgreSQL), y NODE_ENV.
7. WHEN la aplicación inicia exitosamente, THE Sistema_API SHALL escuchar conexiones HTTP en el puerto especificado por la variable de entorno PORT y registrar en stdout un mensaje indicando el puerto activo.

---

### Requisito 2: Configuración de Base de Datos y Migraciones

**Historia de Usuario:** Como desarrollador del equipo, quiero una conexión a PostgreSQL configurada con pool y un sistema de migraciones versionadas, para que el esquema de la base de datos sea reproducible y controlado.

#### Criterios de Aceptación

1. THE Sistema_API SHALL configurar un pool de conexiones PostgreSQL utilizando la variable de entorno DATABASE_URL como fuente primaria, o en su ausencia, las variables individuales DB_HOST, DB_PORT, DB_NAME, DB_USER y DB_PASSWORD, con un tamaño mínimo de pool de 2 conexiones y un máximo de 10 conexiones, y un timeout de adquisición de conexión de 30 segundos.
2. IF la variable DATABASE_URL no está definida y alguna de las variables individuales obligatorias (DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD) está ausente, THEN THE Sistema_API SHALL fallar en el arranque con un mensaje de error indicando las variables faltantes, sin iniciar el servidor HTTP.
3. IF el pool de conexiones no logra establecer una conexión inicial con PostgreSQL dentro de 30 segundos, THEN THE Sistema_API SHALL fallar en el arranque con un mensaje de error indicando que no se pudo conectar a la base de datos.
4. THE Sistema_API SHALL registrar cada migración ejecutada en una tabla de historial de migraciones con: nombre del archivo (máximo 255 caracteres), timestamp de ejecución (UTC), checksum (hash SHA-256 del contenido del archivo) y estado (éxito o fallo).
5. WHEN se ejecuta el comando de migraciones, THE Sistema_API SHALL aplicar únicamente las migraciones pendientes (aquellas cuyo nombre de archivo no existe en la tabla de historial con estado éxito) en orden cronológico ascendente determinado por el prefijo numérico del nombre de archivo.
6. IF una migración falla durante su ejecución, THEN THE Sistema_API SHALL revertir los cambios de esa migración específica mediante rollback de la transacción, registrar el fallo en la tabla de historial, detener la ejecución de migraciones subsiguientes, y reportar el error con el nombre del archivo y el detalle de la falla.
7. THE Sistema_API SHALL crear las tablas del Catálogo mediante migraciones versionadas, incluyendo como mínimo las columnas: id (UUID, clave primaria), nombre (VARCHAR 255, no nulo), slug (VARCHAR 255, único, no nulo), tipo (enumeración con valores API, Framework, Library), categoría (VARCHAR 100), lenguaje_principal (VARCHAR 100), descripción (TEXT, máximo 5000 caracteres), url_repositorio (VARCHAR 2048), url_documentación (VARCHAR 2048), estrellas_github (INTEGER, mínimo 0), descargas_semanales (INTEGER, mínimo 0), comando_instalación (VARCHAR 512), ejemplo_helloworld (TEXT, máximo 10000 caracteres), fuente_origen (VARCHAR 255), fecha_creación (TIMESTAMP WITH TIME ZONE, asignado automáticamente) y fecha_actualización (TIMESTAMP WITH TIME ZONE, actualizado automáticamente).
8. IF se intenta ejecutar una migración cuyo checksum difiere del registrado en la tabla de historial para el mismo nombre de archivo, THEN THE Sistema_API SHALL rechazar la ejecución e indicar un error de integridad señalando el nombre del archivo modificado.

---

### Requisito 3: Conectores de Fuentes Externas

**Historia de Usuario:** Como desarrollador del equipo, quiero conectores modulares HTTP para consultar APIs.guru, npm Registry, PyPI y GitHub, para que el sistema pueda extraer automáticamente directorios de tecnologías sin acoplar la lógica de negocio a cada fuente.

#### Criterios de Aceptación

1. THE Conector_Externo SHALL implementar una interfaz común con los métodos fetchList (obtener listado paginado, aceptando parámetros offset y limit con un máximo de 100 elementos por invocación) y fetchDetail (obtener detalle individual por identificador único) para cada fuente de datos.
2. THE Conector_Externo SHALL consultar la API de APIs.guru para obtener especificaciones OpenAPI públicas con nombre, descripción, versión y URL de documentación.
3. THE Conector_Externo SHALL consultar la API del registro npm para obtener nombre, descripción, descargas semanales, repositorio, versión y keywords de paquetes.
4. THE Conector_Externo SHALL consultar la API JSON de PyPI para obtener nombre, descripción, versión, descargas, licencia y URL del proyecto de paquetes Python.
5. THE Conector_Externo SHALL consultar la API REST de GitHub para obtener estrellas, licencia, descripción, lenguaje principal y contenido del README de repositorios.
6. THE Conector_Externo SHALL aplicar un timeout de 10 segundos a cada petición HTTP individual hacia una fuente externa; si la respuesta no se recibe dentro de ese plazo, la petición se considerará fallida por timeout.
7. THE Rate_Limiter SHALL limitar las peticiones a cada fuente externa a un máximo configurable por ventana de tiempo (por defecto: 30 peticiones por minuto por fuente, rango válido: 1 a 120 peticiones por minuto).
8. IF una petición a una fuente externa falla con error de red o timeout, THEN THE Conector_Externo SHALL reintentar la petición hasta 3 veces con backoff exponencial (1s, 2s, 4s) antes de registrar el error y continuar con el siguiente elemento.
9. IF una fuente externa responde con código HTTP 429 (rate limit excedido), THEN THE Conector_Externo SHALL pausar las peticiones a esa fuente durante el tiempo indicado en el header Retry-After o 60 segundos si el header no está presente.
10. IF fetchDetail recibe un identificador que no existe en la fuente externa (HTTP 404) o fetchList no encuentra resultados para los parámetros dados, THEN THE Conector_Externo SHALL retornar un resultado vacío (lista vacía para fetchList, null para fetchDetail) sin registrar error.

---

### Requisito 4: Búsqueda Avanzada y Filtros

**Historia de Usuario:** Como consumidor de la API, quiero buscar tecnologías por texto libre y filtrar por tipo, categoría y lenguaje, para que pueda encontrar rápidamente las herramientas que necesito.

#### Criterios de Aceptación

1. WHEN se recibe una petición GET al endpoint de búsqueda con el parámetro query, THE Sistema_API SHALL retornar las tecnologías cuyo nombre o descripción contengan el texto proporcionado (búsqueda case-insensitive, coincidencia parcial de subcadena).
2. WHEN se recibe el parámetro de filtro type con valor "API", "Framework" o "Library", THE Sistema_API SHALL retornar únicamente las tecnologías que coincidan con el tipo especificado (comparación case-insensitive).
3. WHEN se recibe el parámetro de filtro category, THE Sistema_API SHALL retornar únicamente las tecnologías que coincidan con la categoría especificada (Frontend, Backend, ML, Auth, entre otras, comparación case-insensitive).
4. WHEN se recibe el parámetro de filtro language, THE Sistema_API SHALL retornar únicamente las tecnologías cuyo lenguaje principal coincida con el valor proporcionado (comparación case-insensitive).
5. WHEN se reciben múltiples filtros simultáneamente (cualquier combinación de query, type, category, language), THE Sistema_API SHALL aplicar lógica AND entre todos los filtros proporcionados y retornar únicamente las tecnologías que satisfagan todas las condiciones.
6. WHEN se recibe el parámetro sort con valor "popularity", "downloads" o "recent", THE Sistema_API SHALL ordenar los resultados por estrellas de GitHub descendente (popularity), descargas semanales descendente (downloads) o fecha de creación descendente (recent) respectivamente.
7. THE Sistema_API SHALL paginar los resultados de búsqueda utilizando los parámetros page (por defecto: 1, mínimo: 1) y limit (por defecto: 20, mínimo: 1, máximo: 100).
8. THE Sistema_API SHALL incluir en la respuesta paginada los campos: total (número total de resultados que coinciden con la búsqueda/filtros), page (página actual), limit (tamaño de página), totalPages (total de páginas calculado como ceil(total/limit)) y data (array de tecnologías).
9. IF el parámetro query está vacío y no se proporcionan filtros, THEN THE Sistema_API SHALL retornar el listado completo de tecnologías paginado con el orden por defecto (recent).
10. IF el parámetro page excede el total de páginas disponibles, THEN THE Sistema_API SHALL retornar un array data vacío con los metadatos de paginación correctos (total, page solicitado, limit y totalPages reflejando los valores reales).
11. IF el parámetro limit excede 100, THEN THE Sistema_API SHALL limitar el tamaño de página a 100 sin retornar error.
12. IF el parámetro type contiene un valor distinto de "API", "Framework" o "Library", THEN THE Sistema_API SHALL retornar un error de validación con código HTTP 400 indicando los valores permitidos.
13. IF el parámetro sort contiene un valor distinto de "popularity", "downloads" o "recent", THEN THE Sistema_API SHALL retornar un error de validación con código HTTP 400 indicando los valores permitidos.
14. IF el parámetro page o limit contiene un valor no numérico o menor a 1, THEN THE Sistema_API SHALL retornar un error de validación con código HTTP 400 indicando que el valor debe ser un entero positivo.

---

### Requisito 5: Ficha de Detalle de Tecnología

**Historia de Usuario:** Como consumidor de la API, quiero obtener una ficha detallada de una tecnología específica incluyendo un resumen estructurado "Aprende en 10 Minutos", para que pueda evaluar rápidamente si la herramienta es útil para mi caso.

#### Criterios de Aceptación

1. WHEN se recibe una petición GET al endpoint de detalle con un ID (UUID) válido, THE Sistema_API SHALL retornar la Ficha_Detalle completa de la tecnología correspondiente con código HTTP 200 y tiempo de respuesta no superior a 2000 ms.
2. WHEN se recibe una petición GET al endpoint de detalle con un Slug válido (cadena alfanumérica en minúsculas separada por guiones, de 1 a 128 caracteres), THE Sistema_API SHALL retornar la Ficha_Detalle completa de la tecnología correspondiente con código HTTP 200 y tiempo de respuesta no superior a 2000 ms.
3. THE Ficha_Detalle SHALL incluir la sección "Aprende en 10 Minutos" con los campos: que_es (descripción concisa de máximo 280 caracteres), caso_uso_principal (propósito principal de máximo 280 caracteres), comando_instalacion (comando para instalar de máximo 512 caracteres) y ejemplo_helloworld (código de ejemplo mínimo funcional de máximo 2000 caracteres extraído del README o documentación).
4. THE Ficha_Detalle SHALL incluir métricas dinámicas: estrellas_github (número entero mayor o igual a 0) y descargas_semanales (número entero mayor o igual a 0).
5. IF las métricas dinámicas (estrellas_github o descargas_semanales) no están disponibles por fallo en la fuente externa, THEN THE Sistema_API SHALL retornar la Ficha_Detalle con el valor null en los campos de métricas no disponibles, sin bloquear la respuesta del resto de la ficha.
6. THE Ficha_Detalle SHALL incluir los campos base: id (UUID), nombre (máximo 128 caracteres), slug (máximo 128 caracteres), tipo, categoría, lenguaje_principal, descripción (máximo 1000 caracteres), url_repositorio, url_documentación, fuente_origen, fecha_creación (formato ISO 8601) y fecha_actualización (formato ISO 8601).
7. IF el ID o Slug proporcionado no corresponde a ninguna tecnología registrada, THEN THE Sistema_API SHALL retornar código HTTP 404 con un mensaje indicando que la tecnología no fue encontrada.
8. IF el ID proporcionado no es un UUID válido y no cumple el formato de Slug válido, THEN THE Sistema_API SHALL retornar código HTTP 400 con un mensaje indicando que el formato del identificador es inválido.
9. IF alguno de los campos de la sección "Aprende en 10 Minutos" no ha sido generado aún para la tecnología solicitada, THEN THE Sistema_API SHALL retornar el campo correspondiente con valor null dentro de la Ficha_Detalle.

---

### Requisito 6: Caché Local en PostgreSQL

**Historia de Usuario:** Como operador del sistema, quiero que las respuestas de APIs externas se almacenen localmente en PostgreSQL, para que las lecturas sean rápidas y no se excedan los rate limits de las fuentes externas.

#### Criterios de Aceptación

1. WHEN el Conector_Externo recibe una respuesta exitosa (código HTTP 2xx) de una fuente externa, THE Caché_Local SHALL almacenar la respuesta en PostgreSQL con la clave de consulta, el cuerpo de la respuesta como JSON, la fuente de origen y un timestamp de expiración calculado según el tiempo de expiración configurado para esa fuente.
2. WHEN se solicita información al Conector_Externo y existe una entrada en Caché_Local cuyo timestamp de expiración es posterior al momento actual para esa clave de consulta, THE Conector_Externo SHALL retornar los datos desde el Caché_Local sin realizar una petición a la fuente externa, en un tiempo no mayor a 200 ms.
3. THE Caché_Local SHALL utilizar un tiempo de expiración configurable por fuente, con valores por defecto de 24 horas para APIs.guru, 6 horas para npm y PyPI, y 12 horas para GitHub, permitiendo modificar estos valores sin reiniciar la aplicación mediante variables de entorno o configuración externa.
4. WHEN una entrada de caché ha expirado (timestamp de expiración anterior o igual al momento actual) y se solicita información para esa clave de consulta, THE Conector_Externo SHALL realizar una nueva petición a la fuente externa y, al recibir una respuesta exitosa (código HTTP 2xx), actualizar la entrada en Caché_Local reemplazando el cuerpo de la respuesta y recalculando el timestamp de expiración.
5. IF la petición a la fuente externa falla (error de red, timeout tras 10 segundos, o código HTTP 4xx/5xx) y existe una entrada expirada en Caché_Local para esa clave de consulta, THEN THE Conector_Externo SHALL retornar los datos expirados del Caché_Local e incluir en la respuesta una indicación de que los datos provienen de caché expirado, y registrar una advertencia en los logs con la fuente, la clave de consulta y el tipo de error.
6. IF la petición a la fuente externa falla y no existe ninguna entrada en Caché_Local (ni vigente ni expirada) para esa clave de consulta, THEN THE Conector_Externo SHALL retornar un error indicando que la fuente externa no está disponible y que no hay datos en caché para esa consulta.
7. THE Caché_Local SHALL limitar el tamaño máximo del cuerpo de respuesta almacenado a 5 MB por entrada, descartando sin almacenar respuestas que excedan este límite.
8. WHEN el número total de entradas expiradas en Caché_Local supera las 10,000 filas, THE Caché_Local SHALL eliminar las entradas expiradas con mayor antigüedad (ordenadas por timestamp de expiración ascendente) hasta reducir el conteo de entradas expiradas por debajo de ese umbral.

---

### Requisito 7: Script de Seeding Inicial

**Historia de Usuario:** Como desarrollador del equipo, quiero un script de seeding que pueble la base de datos con un conjunto representativo de tecnologías, para que el sistema tenga datos desde el primer despliegue.

#### Criterios de Aceptación

1. WHEN se ejecuta el Script_Seeding, THE Sistema_API SHALL consultar las fuentes externas y poblar el Catálogo con un mínimo de 50 tecnologías, incluyendo al menos 10 tecnologías por cada categoría (APIs, frameworks, bibliotecas).
2. WHEN el Script_Seeding obtiene datos de una fuente externa, THE Sistema_API SHALL normalizar cada registro al esquema unificado del Catálogo, asegurando que los campos obligatorios (nombre, categoría, fuente_origen, identificador_externo) estén presentes antes de insertarlo.
3. THE Script_Seeding SHALL generar un Slug único a partir del nombre de cada tecnología, compuesto exclusivamente por caracteres alfanuméricos en minúscula y guiones, con una longitud máxima de 100 caracteres, resolviendo colisiones mediante sufijo numérico incremental (e.g., "-2", "-3").
4. IF una tecnología ya existe en el Catálogo (identificada por fuente_origen + identificador externo), THEN THE Script_Seeding SHALL actualizar los campos modificados sin duplicar el registro.
5. WHEN el Script_Seeding finaliza, THE Sistema_API SHALL registrar en logs un resumen con: total de tecnologías procesadas, insertadas, actualizadas y con error.
6. THE Script_Seeding SHALL ejecutar las inserciones y actualizaciones dentro de una transacción por lote (batch de 50 registros); IF un batch falla, THEN THE Script_Seeding SHALL revertir únicamente ese batch, registrar el error en logs y continuar con el siguiente lote.
7. IF una fuente externa no responde en un plazo de 30 segundos o retorna un error, THEN THE Script_Seeding SHALL registrar el fallo en logs, omitir esa fuente y continuar el proceso con las fuentes restantes.
8. IF un registro obtenido de una fuente externa carece de alguno de los campos obligatorios (nombre, categoría, fuente_origen, identificador_externo), THEN THE Script_Seeding SHALL descartar ese registro, contabilizarlo como error en el resumen final y continuar con el siguiente registro.

---

### Requisito 8: Manejo de Errores y Respuestas del API

**Historia de Usuario:** Como consumidor de la API, quiero respuestas de error consistentes y descriptivas, para que pueda diagnosticar problemas de integración sin ambigüedad.

#### Criterios de Aceptación

1. THE Sistema_API SHALL retornar todas las respuestas de error en formato JSON con la estructura: { error: { code: string, message: string, details?: object } }.
2. WHEN se recibe una petición a un endpoint inexistente, THE Sistema_API SHALL retornar código HTTP 404 con code "NOT_FOUND" y message indicando que el recurso solicitado no existe.
3. WHEN se reciben parámetros de consulta con tipos o valores inválidos, THE Sistema_API SHALL retornar código HTTP 400 con code "VALIDATION_ERROR" y details conteniendo un arreglo de objetos donde cada objeto incluye el nombre del campo con error y una descripción del motivo de rechazo.
4. IF ocurre un error interno no controlado, THEN THE Sistema_API SHALL retornar código HTTP 500 con code "INTERNAL_ERROR" y message genérico que no exponga nombres de clases, rutas de archivos, queries SQL ni stack traces del sistema.
5. IF ocurre un error interno no controlado, THEN THE Sistema_API SHALL registrar en los logs del servidor el stack trace completo, el método HTTP, la ruta solicitada, los parámetros de consulta y un identificador único de correlación que también se incluya en la respuesta al cliente dentro del campo error.details.
6. THE Sistema_API SHALL incluir el header Content-Type: application/json en todas las respuestas (éxito y error).
7. THE Sistema_API SHALL retornar código HTTP 200 para respuestas exitosas de consulta (búsqueda y detalle).
8. WHEN se recibe una petición con un método HTTP no soportado por el endpoint, THE Sistema_API SHALL retornar código HTTP 405 con code "METHOD_NOT_ALLOWED" y message indicando los métodos permitidos para ese recurso.
9. IF el cuerpo de la petición no es JSON válido cuando se espera JSON, THEN THE Sistema_API SHALL retornar código HTTP 400 con code "INVALID_JSON" y message indicando que el cuerpo de la petición no pudo ser parseado como JSON.
10. THE Sistema_API SHALL responder a toda petición de error en un tiempo máximo de 500 milisegundos desde la recepción de la solicitud.

---

### Requisito 9: Validación de Entrada

**Historia de Usuario:** Como consumidor de la API, quiero que los parámetros de entrada se validen antes de procesarse, para que errores de formato se detecten tempranamente con mensajes claros.

#### Criterios de Aceptación

1. WHEN se recibe un parámetro type con valor distinto a "API", "Framework" o "Library", THE Sistema_API SHALL retornar código HTTP 400 con un mensaje de error indicando los valores permitidos ("API", "Framework", "Library").
2. WHEN se recibe un parámetro sort con valor distinto a "popularity", "downloads" o "recent", THE Sistema_API SHALL retornar código HTTP 400 con un mensaje de error indicando los valores permitidos ("popularity", "downloads", "recent").
3. WHEN se recibe un parámetro page con valor no numérico o menor a 1, THE Sistema_API SHALL retornar código HTTP 400 con un mensaje de error indicando que page debe ser un entero positivo.
4. WHEN se recibe un parámetro limit con valor no numérico, menor a 1 o mayor a 100, THE Sistema_API SHALL retornar código HTTP 400 con un mensaje de error indicando que limit debe ser un entero entre 1 y 100.
5. WHEN se recibe un parámetro query con longitud superior a 200 caracteres, THE Sistema_API SHALL retornar código HTTP 400 con un mensaje de error indicando que la longitud máxima de búsqueda es 200 caracteres.
6. WHEN se reciben múltiples parámetros inválidos en una misma petición, THE Sistema_API SHALL retornar código HTTP 400 con un mensaje de error que liste todas las violaciones de validación detectadas.
7. IF se recibe un parámetro no reconocido por el endpoint, THEN THE Sistema_API SHALL ignorar dicho parámetro y procesar la petición con los parámetros válidos restantes.
8. WHEN se recibe un parámetro query vacío (cadena de longitud 0 o solo espacios en blanco), THE Sistema_API SHALL retornar código HTTP 400 con un mensaje de error indicando que el parámetro query no puede estar vacío.

---

### Requisito 10: Configuración y Health Check

**Historia de Usuario:** Como operador del sistema, quiero un endpoint de salud y configuración centralizada, para que pueda verificar que el servicio está operativo y todas las dependencias responden.

#### Criterios de Aceptación

1. WHEN se recibe una petición GET al endpoint /health, THE Sistema_API SHALL retornar código HTTP 200 con un objeto JSON que incluya: status ("healthy" o "degraded"), timestamp (formato ISO 8601 con zona horaria UTC), version (versión de la aplicación tomada de package.json) y checks (objeto con el estado de cada dependencia verificada).
2. THE Sistema_API SHALL verificar la conectividad a PostgreSQL ejecutando una consulta de prueba con un timeout máximo de 5 segundos, e incluir el resultado en el campo checks.database con valor "connected" o "disconnected".
3. IF la conexión a PostgreSQL falla o excede el timeout de 5 segundos durante el health check, THEN THE Sistema_API SHALL retornar status "degraded" en lugar de "healthy" manteniendo código HTTP 200, e incluir checks.database con valor "disconnected".
4. THE Sistema_API SHALL leer la configuración del servidor (puerto, host de base de datos, timeouts de caché, límites de rate) exclusivamente desde variables de entorno, sin valores hardcodeados en el código fuente.
5. IF una variable de entorno requerida (puerto, host de base de datos) no está definida al iniciar la aplicación, THEN THE Sistema_API SHALL impedir el arranque del servidor y registrar un mensaje de error indicando el nombre de la variable faltante.
6. WHEN se recibe una petición al endpoint /health, THE Sistema_API SHALL responder en un tiempo máximo de 10 segundos; si la verificación de dependencias excede este tiempo, SHALL retornar el resultado parcial disponible con status "degraded".
