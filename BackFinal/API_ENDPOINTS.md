# StackDNA Backend - Documentación de Endpoints API

## Información General

| Propiedad | Valor |
|-----------|-------|
| **URL Base** | `http://localhost:3000` |
| **Formato** | JSON (`Content-Type: application/json`) |
| **CORS** | Habilitado para todos los orígenes |
| **Autenticación** | No requiere (pendiente de implementar) |

> Todos los endpoints retornan respuestas en formato JSON. Los requests que envíen datos deben usar `Content-Type: application/json` en el header.

---

## Tabla de Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/technologies` | Buscar y filtrar tecnologías |
| `GET` | `/api/technologies/:slug` | Obtener detalle de una tecnología |
| `GET` | `/api/categories` | Listar categorías disponibles |
| `GET` | `/api/ecosystems` | Listar ecosistemas disponibles |
| `POST` | `/api/admin/sync/:source` | Ejecutar sincronización manual |
| `GET` | `/api/admin/sync/status` | Consultar estado de sincronizaciones |

---

## 1. GET /api/technologies

Busca tecnologías aplicando filtros opcionales. Soporta búsqueda de texto libre y filtros por tipo, categoría y lenguaje.

### Parámetros Query (Todos opcionales)

| Parámetro | Tipo | Valores permitidos | Descripción |
|-----------|------|--------------------|-------------|
| `query` | string | cualquier texto | Búsqueda de texto libre (nombre, descripción, slug, tags) |
| `type` | string | `api`, `framework`, `libreria`, `herramienta` | Filtrar por tipo de tecnología |
| `category` | string | ver [Categorías válidas](#categorías-válidas) | Filtrar por categoría |
| `lang` | string | `javascript`, `python`, `java` | Filtrar por lenguaje |
| `page` | integer | >= 1 (default: 1) | Número de página |
| `limit` | integer | 1-100 (default: 20) | Resultados por página |

### Ejemplos de Request

**Sin filtros (primeros 20 resultados):**
```bash
curl http://localhost:3000/api/technologies
```

```javascript
fetch('http://localhost:3000/api/technologies')
  .then(res => res.json())
  .then(data => console.log(data));
```

**Búsqueda de texto libre:**
```bash
curl "http://localhost:3000/api/technologies?query=react"
```

```javascript
fetch('http://localhost:3000/api/technologies?query=react')
  .then(res => res.json())
  .then(data => console.log(data));
```

**Filtrar por lenguaje y tipo:**
```bash
curl "http://localhost:3000/api/technologies?lang=python&type=libreria"
```

```javascript
fetch('http://localhost:3000/api/technologies?lang=python&type=libreria')
  .then(res => res.json())
  .then(data => console.log(data));
```

**Paginación:**
```bash
curl "http://localhost:3000/api/technologies?page=2&limit=10"
```

```javascript
fetch('http://localhost:3000/api/technologies?page=2&limit=10')
  .then(res => res.json())
  .then(data => console.log(data));
```

**Búsqueda natural (el backend interpreta la query):**
```bash
curl "http://localhost:3000/api/technologies?query=framework+javascript"
curl "http://localhost:3000/api/technologies?query=libreria+python+testing"
```

> **Nota:** El backend tiene un parser de lenguaje natural que detecta automáticamente el lenguaje, tipo o categoría a partir de la query. Por ejemplo, `query=framework javascript` buscará frameworks de JavaScript automáticamente.

### Respuesta JSON (Éxito) - 200 OK

```json
{
  "items": [
    {
      "id": 1,
      "slug": "express",
      "nombre": "express",
      "tipo": "framework",
      "lenguaje": "javascript",
      "ecosistema": "npm",
      "categoria": "web-framework",
      "descripcion": "Fast, unopinionated, minimalist web framework for node.js",
      "logo_url": "https://cdn.simpleicons.org/express",
      "repo_url": "https://github.com/expressjs/express",
      "docs_url": "https://expressjs.com/",
      "homepage_url": "https://expressjs.com/",
      "version": "4.18.2",
      "stats": {
        "license": "MIT",
        "weeklyDownloads": 20000000
      },
      "tags": ["express", "web", "http", "framework", "middleware"],
      "key_features": [],
      "use_cases": [],
      "installation": "npm install express",
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-06-20T14:22:00.000Z"
    },
    {
      "id": 2,
      "slug": "fastify",
      "nombre": "fastify",
      "tipo": "framework",
      "lenguaje": "javascript",
      "ecosistema": "npm",
      "categoria": "web-framework",
      "descripcion": "Fast and low overhead web framework for Node.js",
      "logo_url": "https://cdn.simpleicons.org/fastify",
      "repo_url": "https://github.com/fastify/fastify",
      "docs_url": "https://fastify.dev/docs/",
      "homepage_url": "https://fastify.dev/",
      "version": "4.17.0",
      "stats": {
        "license": "MIT"
      },
      "tags": ["fastify", "web", "http", "framework"],
      "key_features": [],
      "use_cases": [],
      "installation": "npm install fastify",
      "created_at": "2024-01-15T10:35:00.000Z",
      "updated_at": "2024-06-20T14:25:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 135,
    "pages": 7
  }
}
```

### Campos del Objeto Technology

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | integer | ID autoincremental |
| `slug` | string | Identificador único (usado para buscar por URL) |
| `nombre` | string | Nombre de la tecnología |
| `tipo` | string | Tipo: `api`, `framework`, `libreria`, `herramienta` |
| `lenguaje` | string | Lenguaje: `javascript`, `python`, `java` |
| `ecosistema` | string | Ecosistema: `npm`, `pypi`, `maven` |
| `categoria` | string | Categoría funcional (ver lista completa abajo) |
| `descripcion` | string | Descripción de la tecnología |
| `logo_url` | string | URL del logo (generado automáticamente via simpleicons.org) |
| `repo_url` | string | URL del repositorio |
| `docs_url` | string | URL de la documentación |
| `homepage_url` | string | URL de la página principal |
| `version` | string | Última versión disponible |
| `stats` | object | Objeto con estadísticas (licencia, descargas, etc.) |
| `tags` | array[string] | Tags/etiquetas de la tecnología |
| `key_features` | array[string] | Características principales (pendiente de poblar) |
| `use_cases` | array[string] | Casos de uso (pendiente de poblar) |
| `installation` | string | Instrucciones de instalación |
| `created_at` | string | Fecha de creación (ISO 8601) |
| `updated_at` | string | Fecha de última actualización (ISO 8601) |

---

## 2. GET /api/technologies/:slug

Obtiene el detalle completo de una tecnología específica por su `slug`.

### Parámetros de Ruta

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `slug` | string | Slug de la tecnología (ej: `express`, `react`, `django`) |

### Ejemplos de Request

```bash
curl http://localhost:3000/api/technologies/express
curl http://localhost:3000/api/technologies/react
curl http://localhost:3000/api/technologies/django
```

```javascript
fetch('http://localhost:3000/api/technologies/express')
  .then(res => res.json())
  .then(data => console.log(data));
```

### Respuesta JSON (Éxito) - 200 OK

```json
{
  "id": 1,
  "slug": "express",
  "nombre": "express",
  "tipo": "framework",
  "lenguaje": "javascript",
  "ecosistema": "npm",
  "categoria": "web-framework",
  "descripcion": "Fast, unopinionated, minimalist web framework for node.js",
  "logo_url": "https://cdn.simpleicons.org/express",
  "repo_url": "https://github.com/expressjs/express",
  "docs_url": "https://expressjs.com/",
  "homepage_url": "https://expressjs.com/",
  "version": "4.18.2",
  "stats": {
    "license": "MIT",
    "weeklyDownloads": 20000000
  },
  "tags": ["express", "web", "http", "framework", "middleware"],
  "key_features": [],
  "use_cases": [],
  "installation": "npm install express",
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-06-20T14:22:00.000Z"
}
```

### Respuesta JSON (No encontrado) - 404 Not Found

```json
{
  "error": "Technology not found"
}
```

---

## 3. GET /api/categories

Retorna la lista de categorías disponibles con el número de tecnologías en cada una. Útil para poblar filtros de UI.

### Ejemplo de Request

```bash
curl http://localhost:3000/api/categories
```

```javascript
fetch('http://localhost:3000/api/categories')
  .then(res => res.json())
  .then(data => console.log(data));
```

### Respuesta JSON (Éxito) - 200 OK

```json
[
  {
    "categoria": "web-framework",
    "count": "12"
  },
  {
    "categoria": "testing",
    "count": "8"
  },
  {
    "categoria": "database",
    "count": "7"
  },
  {
    "categoria": "auth",
    "count": "5"
  },
  {
    "categoria": "http-client",
    "count": "4"
  },
  {
    "categoria": "cli",
    "count": "3"
  }
]
```

> **Nota:** El `count` viene como string porque PostgreSQL lo retorna así. Parsear a integer en el frontend si se necesita hacer comparaciones matemáticas.

---

## 4. GET /api/ecosystems

Retorna la lista de ecosistemas disponibles con el número de tecnologías en cada uno. Útil para poblar filtros de UI.

### Ejemplo de Request

```bash
curl http://localhost:3000/api/ecosystems
```

```javascript
fetch('http://localhost:3000/api/ecosystems')
  .then(res => res.json())
  .then(data => console.log(data));
```

### Respuesta JSON (Éxito) - 200 OK

```json
[
  {
    "ecosistema": "npm",
    "count": "52"
  },
  {
    "ecosistema": "pypi",
    "count": "45"
  },
  {
    "ecosistema": "maven",
    "count": "54"
  }
]
```

---

## 5. POST /api/admin/sync/:source

Ejecuta una sincronización manual desde un registro de paquetes externo. La sincronización descarga metadata de las APIs públicas y la almacena/actualiza en la base de datos.

### Parámetros de Ruta

| Parámetro | Tipo | Valores permitidos | Descripción |
|-----------|------|--------------------|-------------|
| `source` | string | `npm`, `pypi`, `maven`, `all` | Fuente de datos a sincronizar |

### Ejemplos de Request

**Sincronizar solo npm:**
```bash
curl -X POST http://localhost:3000/api/admin/sync/npm
```

```javascript
fetch('http://localhost:3000/api/admin/sync/npm', {
  method: 'POST'
})
  .then(res => res.json())
  .then(data => console.log(data));
```

**Sincronizar solo PyPI:**
```bash
curl -X POST http://localhost:3000/api/admin/sync/pypi
```

**Sincronizar solo Maven:**
```bash
curl -X POST http://localhost:3000/api/admin/sync/maven
```

**Sincronizar todas las fuentes:**
```bash
curl -X POST http://localhost:3000/api/admin/sync/all
```

```javascript
fetch('http://localhost:3000/api/admin/sync/all', {
  method: 'POST'
})
  .then(res => res.json())
  .then(data => console.log(data));
```

> **Importante:** No se envía body en este request. Solo se usa el parámetro de ruta.

### Respuesta JSON (Éxito) - 200 OK

**Respuesta para una sola fuente:**
```json
{
  "message": "Sync completed for npm",
  "result": {
    "fuente": "npm",
    "status": "success",
    "items_synced": 52,
    "error_message": null,
    "executed_at": "2024-06-20T14:30:00.000Z"
  }
}
```

**Respuesta para `all`:**
```json
{
  "message": "All syncs completed",
  "results": {
    "npm": {
      "fuente": "npm",
      "status": "success",
      "items_synced": 52,
      "error_message": null
    },
    "pypi": {
      "fuente": "pypi",
      "status": "success",
      "items_synced": 45,
      "error_message": null
    },
    "maven": {
      "fuente": "maven",
      "status": "success",
      "items_synced": 54,
      "error_message": null
    }
  }
}
```

### Respuesta JSON (Sincronización en progreso) - 409 Conflict

```json
{
  "error": "Sync already in progress"
}
```

### Respuesta JSON (Fuente inválida) - 500 Internal Server Error

```json
{
  "error": "Unknown source: rubygems"
}
```

---

## 6. GET /api/admin/sync/status

Retorna las últimas 20 entradas del log de sincronizaciones, ordenadas de más reciente a más antigua.

### Ejemplo de Request

```bash
curl http://localhost:3000/api/admin/sync/status
```

```javascript
fetch('http://localhost:3000/api/admin/sync/status')
  .then(res => res.json())
  .then(data => console.log(data));
```

### Respuesta JSON (Éxito) - 200 OK

```json
[
  {
    "fuente": "npm",
    "status": "success",
    "items_synced": 52,
    "error_message": null,
    "executed_at": "2024-06-20T14:30:00.000Z"
  },
  {
    "fuente": "pypi",
    "status": "success",
    "items_synced": 45,
    "error_message": null,
    "executed_at": "2024-06-20T14:25:00.000Z"
  },
  {
    "fuente": "maven",
    "status": "error",
    "items_synced": 0,
    "error_message": "ECONNREFUSED: Connection refused to search.maven.org",
    "executed_at": "2024-06-20T03:00:00.000Z"
  }
]
```

---

## Manejo de Errores

### Errores de Validación - 400 Bad Request

Cuando se envían parámetros inválidos en `GET /api/technologies`:

```json
{
  "errors": [
    {
      "value": "invalido",
      "msg": "Invalid value",
      "param": "type",
      "location": "query"
    }
  ]
}
```

### Errores Generales - Formato Estándar

Todos los errores siguen este formato:

```json
{
  "error": "Mensaje descriptivo del error"
}
```

### Códigos de Error HTTP

| Código | Significado | Causa común |
|--------|-------------|-------------|
| `400` | Bad Request | Parámetros de query inválidos |
| `404` | Not Found | Tecnología no encontrada por slug |
| `409` | Conflict | Sincronización ya en progreso, o duplicado en DB |
| `500` | Internal Server Error | Error del servidor o de conexión a DB |

### Errores de PostgreSQL (se traducen automáticamente)

| Código PG | HTTP Status | Significado |
|-----------|-------------|-------------|
| `23505` | 409 | Entrada duplicada (unique constraint) |
| `23503` | 400 | Registro referenciado no encontrado (foreign key) |
| `22P02` | 400 | Sintaxis de entrada inválida |

---

## Categorías Válidas

Estas son todas las categorías que el sistema puede asignar automáticamente durante la sincronización:

| Categoría | Descripción |
|-----------|-------------|
| `auth` | Autenticación y autorización |
| `cli` | Herramientas de línea de comandos |
| `cache` | Caché y almacenamiento temporal |
| `config` | Configuración de aplicaciones |
| `crypto` | Criptografía y encriptación |
| `csv` | Manejo de archivos CSV |
| `database` | Bases de datos y conectores |
| `date` | Manejo de fechas |
| `email` | Envío de correos |
| `encryption` | Encriptación de datos |
| `files` | Manejo de archivos |
| `graphql` | GraphQL |
| `http-client` | Clientes HTTP y peticiones API |
| `image` | Manejo de imágenes |
| `json` | Manejo de JSON |
| `logging` | Logging y monitoreo |
| `middleware` | Middleware |
| `monitoring` | Monitoreo de aplicaciones |
| `orm` | ORM (Object-Relational Mapping) |
| `pagos` | Procesamiento de pagos |
| `queue` | Colas de mensajes |
| `scheduler` | Tareas programadas |
| `security` | Seguridad |
| `strings` | Manipulación de texto |
| `testing` | Testing y pruebas |
| `ui` | Interfaces de usuario |
| `utility` | Utilidades generales |
| `validation` | Validación de datos |
| `websocket` | WebSockets |
| `web-framework` | Frameworks web |
| `xml` | Manejo de archivos XML |

---

## Sincronización Automática

El backend ejecuta sincronizaciones automáticas según estos cron jobs:

| Fuente | Frecuencia | Cron |
|--------|------------|------|
| npm | Cada 6 horas | `0 */6 * * *` |
| pypi | Cada 6 horas | `0 */6 * * *` |
| maven | Diario a las 3 AM | `0 3 * * *` |

> Si la base de datos está vacía al iniciar el servidor, se ejecuta una sincronización completa automática de las 3 fuentes.

---

## Notas para el Frontend

1. **El `count` en categorías y ecosistemas viene como string.** Ejemplo: `"count": "12"`. Parsear a integer si se necesita:
   ```javascript
   const count = parseInt(categoria.count);
   ```

2. **La búsqueda es case-insensitive.** El backend usa `ILIKE` en PostgreSQL, así que no es necesario normalizar la query del usuario.

3. **El parser de lenguaje natural funciona con la query.** Se pueden enviar queries como `"framework javascript"` o `"libreria python testing"` y el backend interpretará automáticamente los filtros.

4. **El campo `slug` es el identificador único para URLs.** Para navegar al detalle de una tecnología, usar: `/api/technologies/${tech.slug}`.

5. **Los campos `key_features` y `use_cases` vienen vacíos.** Están reservados para funcionalidad futura, no renderizar en UI por ahora.

6. **No hay paginación en categorías ni ecosistemas.** Se retornan todos los registros disponibles.

7. **La respuesta de `GET /api/technologies` siempre incluye el objeto `pagination`.** Usarlo para renderizar controles de paginación:
   ```javascript
   const { items, pagination } = response;
   // pagination.page  -> página actual
   // pagination.pages -> total de páginas
   // pagination.total -> total de resultados
   ```

8. **Los admin endpoints no requieren autenticación.** Cualquier usuario puede ejecutar sincronizaciones.
