# Plan de Implementación: Technology Catalog API

## Resumen

Implementación incremental de una API REST con Node.js, Express y TypeScript que agrega información de tecnologías desde múltiples fuentes externas, almacena en PostgreSQL y expone endpoints de búsqueda avanzada y fichas de detalle. La implementación sigue la arquitectura limpia por capas definida en el diseño.

## Tasks

- [x] 1. Scaffolding del proyecto e infraestructura base
  - [x] 1.1 Crear estructura de carpetas, package.json y tsconfig.json
    - Crear la estructura de directorios: src/config, src/controllers, src/services, src/services/connectors, src/repositories, src/routes, src/middlewares, src/utils, src/types, src/migrations/scripts, scripts, tests/unit, tests/integration, tests/property
    - Crear package.json con dependencias pinned: express@4.21, pg@8.13, zod@3.23, axios@1.7, axios-retry@4.5, bottleneck@2.19, dotenv@16.4, y devDependencies: typescript@5.4, vitest@2.1, fast-check@3.22, supertest@7.0, @types/express, @types/pg, @types/supertest, ts-node, tsx
    - Crear tsconfig.json con strict mode, target ES2020, module NodeNext, moduleResolution NodeNext, outDir dist, rootDir src
    - Crear .env.example con todas las variables requeridas documentadas
    - _Requisitos: 1.1, 1.2, 1.3_

  - [x] 1.2 Implementar carga y validación de variables de entorno
    - Crear src/config/env.ts con esquema Zod que valide PORT, DATABASE_URL (o DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD), NODE_ENV, GITHUB_TOKEN (opcional), y TTLs de caché
    - Si falta alguna variable requerida, terminar proceso con exit code 1 y mensaje en stderr
    - Crear src/config/index.ts que exporte la configuración validada
    - _Requisitos: 1.4, 1.5, 1.6, 10.4, 10.5_

  - [x] 1.3 Configurar pool de conexiones PostgreSQL
    - Crear src/config/database.ts que configure pg Pool con: min 2, max 10 conexiones, connectionTimeoutMillis 30000
    - Soportar DATABASE_URL como fuente primaria o variables individuales
    - Exportar pool como singleton reutilizable
    - _Requisitos: 2.1, 2.2, 2.3_

  - [x] 1.4 Crear bootstrap de la aplicación Express
    - Crear src/app.ts que inicialice Express, configure JSON parsing, registre rutas y middlewares
    - Escuchar en el puerto configurado y registrar en stdout el mensaje de inicio
    - _Requisitos: 1.7_

- [x] 2. Sistema de migraciones y esquema de base de datos
  - [x] 2.1 Implementar el motor de migraciones
    - Crear src/migrations/runner.ts con lógica para: descubrir archivos SQL, calcular checksum SHA-256, ejecutar pendientes en orden, registrar en tabla de historial
    - Implementar rollback por transacción si una migración falla
    - Verificar integridad de checksum para migraciones ya ejecutadas
    - _Requisitos: 2.4, 2.5, 2.6, 2.8_

  - [x] 2.2 Crear scripts SQL de migración
    - Crear src/migrations/scripts/001_create_migrations_table.sql con tabla migrations_history (id SERIAL PK, filename VARCHAR(255) UNIQUE, executed_at TIMESTAMPTZ, checksum VARCHAR(64), status VARCHAR(10), error_detail TEXT)
    - Crear src/migrations/scripts/002_create_technologies_table.sql con tabla technologies según DDL del diseño, incluyendo índices GIN trigram, índices por tipo, categoría, lenguaje, estrellas, descargas y fecha
    - Crear src/migrations/scripts/003_create_cache_table.sql con tabla external_cache según DDL del diseño
    - _Requisitos: 2.4, 2.7_

  - [x] 2.3 Crear repositorio de migraciones
    - Crear src/repositories/migration.repository.ts con métodos: getExecutedMigrations(), recordMigration(), verificar checksum
    - _Requisitos: 2.4, 2.5_

- [x] 3. Checkpoint - Verificar infraestructura base
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Tipos de dominio y utilidades core
  - [x] 4.1 Definir tipos TypeScript del dominio
    - Crear src/types/technology.types.ts con interfaces Technology, ExternalTechnology, TechnologyFilters, PaginationParams, CreateTechnologyDTO
    - Crear src/types/api-response.types.ts con interfaces PaginatedResponse, ErrorResponse, HealthResponse
    - Crear src/types/connector.types.ts con interfaz ExternalConnector y tipos asociados
    - _Requisitos: 3.1, 4.8, 5.6, 8.1_

  - [x] 4.2 Implementar utilidad de generación de slugs
    - Crear src/utils/slug.ts con función generateSlug(nombre): convierte a minúsculas, reemplaza caracteres no alfanuméricos por guiones, elimina guiones consecutivos, limita a 100 caracteres
    - Implementar resolución de colisiones con sufijo numérico incremental (-2, -3, etc.)
    - _Requisitos: 7.3_

  - [x] 4.3 Escribir property test para generación de slugs
    - **Propiedad 4: Slug es determinista y URL-safe**
    - **Valida: Requisitos 7.3**

  - [x] 4.4 Implementar helpers de paginación
    - Crear src/utils/pagination.ts con funciones: calculateOffset(page, limit), calculateTotalPages(total, limit), buildPaginatedResponse(data, total, page, limit)
    - _Requisitos: 4.7, 4.8_

  - [x] 4.5 Escribir property test para paginación
    - **Propiedad 3: Paginación es consistente**
    - **Valida: Requisitos 4.7, 4.8, 4.10**

  - [x] 4.6 Implementar logger
    - Crear src/utils/logger.ts con funciones de logging estructurado (info, warn, error) que incluyan timestamp, level y contexto
    - _Requisitos: 8.5_

- [x] 5. Repositorios de datos
  - [x] 5.1 Implementar repositorio de tecnologías
    - Crear src/repositories/technology.repository.ts con métodos: findByFilters(filters, pagination), findByIdOrSlug(idOrSlug), insert(technology), upsertBySource(technology), count(filters)
    - Implementar queries parametrizadas con construcción dinámica de WHERE según filtros activos
    - Implementar búsqueda textual case-insensitive usando ILIKE en nombre y descripción
    - Implementar ordenamiento dinámico (popularity→estrellas DESC, downloads→descargas DESC, recent→fecha_creacion DESC)
    - _Requisitos: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 5.1, 5.2, 7.4_

  - [x] 5.2 Implementar repositorio de caché
    - Crear src/repositories/cache.repository.ts con métodos: findByKey(cacheKey), upsert(entry), deleteExpired(limit), countExpired()
    - Implementar lógica de limpieza de entradas expiradas (>10,000 filas)
    - _Requisitos: 6.1, 6.2, 6.4, 6.7, 6.8_

- [x] 6. Conectores externos con rate limiting y caché
  - [x] 6.1 Implementar servicio de caché
    - Crear src/services/cache.service.ts con métodos: get(key, fuente), set(key, fuente, body, ttl), getOrFetch(key, fuente, fetchFn)
    - Implementar lógica de cache hit/miss/expired con fallback a datos expirados si fuente externa falla
    - Configurar TTLs por fuente desde variables de entorno
    - _Requisitos: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

  - [x] 6.2 Escribir property test para caché hit
    - **Propiedad 6: Caché hit evita petición externa**
    - **Valida: Requisitos 6.2**

  - [x] 6.3 Implementar interfaz de conector y configuración de rate limiter
    - Crear src/services/connectors/connector.interface.ts con interfaz ExternalConnector
    - Configurar Bottleneck con 30 req/min por defecto por fuente
    - Configurar axios-retry con backoff exponencial (1s, 2s, 4s), 3 reintentos, timeout 10s
    - _Requisitos: 3.1, 3.6, 3.7, 3.8, 3.9_

  - [x] 6.4 Escribir property test para retry con backoff exponencial
    - **Propiedad 7: Retry con backoff exponencial**
    - **Valida: Requisitos 3.8**

  - [x] 6.5 Implementar conector de APIs.guru
    - Crear src/services/connectors/apis-guru.connector.ts que implemente ExternalConnector
    - fetchList: consultar GET /list.json, paginar resultados localmente (offset/limit)
    - fetchDetail: retornar detalle de una API por su identificador
    - Normalizar respuesta al esquema ExternalTechnology
    - _Requisitos: 3.2_

  - [x] 6.6 Implementar conector de npm Registry
    - Crear src/services/connectors/npm.connector.ts que implemente ExternalConnector
    - fetchList: consultar GET /-/v1/search con parámetros text, size, from
    - fetchDetail: consultar GET /{package} para detalle individual
    - Normalizar respuesta al esquema ExternalTechnology
    - _Requisitos: 3.3_

  - [x] 6.7 Implementar conector de PyPI
    - Crear src/services/connectors/pypi.connector.ts que implemente ExternalConnector
    - fetchDetail: consultar GET /pypi/{package}/json
    - fetchList: usar lista predefinida de paquetes populares y consultar detalle de cada uno
    - Normalizar respuesta al esquema ExternalTechnology
    - _Requisitos: 3.4_

  - [x] 6.8 Implementar conector de GitHub
    - Crear src/services/connectors/github.connector.ts que implemente ExternalConnector
    - fetchList: consultar GET /search/repositories con query parametrizado
    - fetchDetail: consultar GET /repos/{owner}/{repo}
    - Soportar GITHUB_TOKEN opcional para rate limits extendidos
    - Normalizar respuesta al esquema ExternalTechnology
    - _Requisitos: 3.5_

  - [x] 6.9 Crear index de conectores
    - Crear src/services/connectors/index.ts que exporte todos los conectores y una factory function para obtenerlos
    - _Requisitos: 3.1_

- [x] 7. Checkpoint - Verificar conectores y caché
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Servicios de negocio
  - [x] 8.1 Implementar servicio de tecnologías
    - Crear src/services/technology.service.ts con métodos: search(filters), getDetail(idOrSlug)
    - search: delegar a repository con filtros validados, construir respuesta paginada
    - getDetail: buscar por ID o slug, enriquecer con métricas dinámicas del caché si disponible
    - Acotar limit a 100 si excede sin retornar error
    - _Requisitos: 4.1-4.14, 5.1-5.9_

  - [x] 8.2 Escribir property test para búsqueda por texto
    - **Propiedad 1: Búsqueda por texto retorna solo coincidencias relevantes**
    - **Valida: Requisitos 4.1**

  - [x] 8.3 Escribir property test para filtros AND
    - **Propiedad 2: Filtros AND reducen resultados**
    - **Valida: Requisitos 4.2, 4.3, 4.4, 4.5**

  - [x] 8.4 Escribir property test para limit acotado
    - **Propiedad 9: Limit se acota a 100**
    - **Valida: Requisitos 4.11**

  - [x] 8.5 Escribir property test para ordenamiento
    - **Propiedad 10: Ordenamiento es correcto**
    - **Valida: Requisitos 4.6**

  - [x] 8.6 Implementar servicio de seeding
    - Crear src/services/seeding.service.ts con lógica para: consultar cada fuente, normalizar registros, insertar/actualizar en batches de 50 dentro de transacciones
    - Manejar errores por batch (rollback individual), por registro (descartar si faltan campos obligatorios) y por fuente (timeout 30s, continuar con siguientes)
    - Generar resumen final: procesadas, insertadas, actualizadas, errores
    - _Requisitos: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8_

- [x] 9. Endpoints REST
  - [x] 9.1 Implementar middleware de validación con Zod
    - Crear src/middlewares/validation.middleware.ts que valide query params del endpoint de búsqueda usando esquemas Zod
    - Validar: query (max 200 chars, no vacío si presente), type (enum), category, language, sort (enum), page (entero positivo), limit (1-100)
    - Retornar 400 con todos los errores de validación simultáneamente
    - Ignorar parámetros no reconocidos
    - _Requisitos: 9.1-9.8_

  - [x] 9.2 Escribir property test para validación
    - **Propiedad 5: Validación rechaza entradas inválidas**
    - **Valida: Requisitos 9.1, 9.2, 9.3, 9.4, 9.5, 9.6**

  - [x] 9.3 Implementar controlador y rutas de tecnologías
    - Crear src/controllers/technology.controller.ts con handlers: searchTechnologies(req, res), getTechnologyDetail(req, res)
    - Crear src/routes/technology.routes.ts registrando GET /api/technologies y GET /api/technologies/:idOrSlug
    - Manejar 405 para métodos no soportados
    - _Requisitos: 4.1-4.14, 5.1-5.9, 8.7, 8.8_

  - [x] 9.4 Implementar controlador y rutas de health check
    - Crear src/controllers/health.controller.ts que verifique conexión a PostgreSQL con timeout 5s
    - Crear src/routes/health.routes.ts registrando GET /health
    - Retornar status healthy/degraded, version desde package.json, timestamp ISO 8601, checks.database
    - _Requisitos: 10.1, 10.2, 10.3, 10.6_

  - [x] 9.5 Crear router principal e integrar rutas
    - Crear src/routes/index.ts que agrupe todas las rutas
    - Integrar en src/app.ts
    - _Requisitos: 1.1_

- [x] 10. Manejo de errores y middlewares globales
  - [x] 10.1 Implementar middleware global de errores
    - Crear src/middlewares/error-handler.middleware.ts que capture cualquier error
    - Si es AppError: responder con statusCode y estructura JSON estándar
    - Si es error desconocido: responder 500 con mensaje genérico, registrar correlationId UUID, stack trace, método, ruta, params
    - Nunca exponer internals al cliente
    - _Requisitos: 8.1, 8.4, 8.5, 8.6_

  - [x] 10.2 Escribir property test para estructura de errores
    - **Propiedad 8: Respuestas de error tienen estructura uniforme**
    - **Valida: Requisitos 8.1, 8.2, 8.3, 8.4**

  - [x] 10.3 Implementar middleware de rutas no encontradas
    - Crear src/middlewares/not-found.middleware.ts que retorne 404 para rutas no registradas
    - _Requisitos: 8.2_

  - [x] 10.4 Definir clases de error personalizadas
    - Crear src/utils/errors.ts con clases: AppError (abstracta), ValidationError, NotFoundError, MethodNotAllowedError, InternalError
    - _Requisitos: 8.1, 8.3, 8.4_

- [x] 11. Script de seeding
  - [x] 11.1 Crear script ejecutable de seeding
    - Crear scripts/seed.ts que instancie los conectores y el servicio de seeding
    - Ejecutar el proceso completo: conectar a DB, correr migraciones si pendientes, ejecutar seeding, imprimir resumen, cerrar pool
    - Agregar script "seed" en package.json
    - _Requisitos: 7.1, 7.5, 7.6, 7.7_

- [x] 12. Checkpoint final - Verificar integración completa
  - Ensure all tests pass, ask the user if questions arise.

## Notas

- Las tareas marcadas con `*` son opcionales y pueden omitirse para un MVP más rápido
- Cada tarea referencia los requisitos específicos que valida para trazabilidad
- Los checkpoints aseguran validación incremental del sistema
- Los property tests validan propiedades universales de corrección definidas en el diseño
- Los unit tests validan casos específicos y condiciones de borde
- El lenguaje de implementación es TypeScript según lo definido en el diseño

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3"] },
    { "id": 2, "tasks": ["1.4", "2.1", "2.2"] },
    { "id": 3, "tasks": ["2.3", "4.1", "4.6"] },
    { "id": 4, "tasks": ["4.2", "4.4", "5.1", "5.2"] },
    { "id": 5, "tasks": ["4.3", "4.5", "6.1", "6.3"] },
    { "id": 6, "tasks": ["6.2", "6.4", "6.5", "6.6", "6.7", "6.8"] },
    { "id": 7, "tasks": ["6.9", "8.1", "8.6"] },
    { "id": 8, "tasks": ["8.2", "8.3", "8.4", "8.5", "10.4"] },
    { "id": 9, "tasks": ["9.1", "9.4", "10.1", "10.3"] },
    { "id": 10, "tasks": ["9.2", "9.3", "10.2"] },
    { "id": 11, "tasks": ["9.5", "11.1"] }
  ]
}
```
