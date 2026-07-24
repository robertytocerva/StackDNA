# StackDNA Backend - Documentación: Módulo Analizador de Repositorios

## Información General

| Propiedad | Valor |
|-----------|-------|
| **URL Base** | `http://localhost:3000` |
| **Prefijo de ruta** | `/api/repo-analyzer` |
| **Formato** | JSON (`Content-Type: application/json`) |
| **Rate Limit** | 5 análisis por día por IP (solo en `POST /analyze`) |
| **Caché** | Los resultados se cachean 24 horas |

### Variables de entorno requeridas

| Variable | Descripción |
|----------|-------------|
| `GITHUB_TOKEN` | Token de acceso personal de GitHub para la API (aumenta límites de rate) |
| `GEMINI_API_KEY` | API Key de Google Gemini para el análisis con IA |

### Dependencias instaladas

| Paquete | Uso |
|---------|-----|
| `express-rate-limit` | Rate limiting en el endpoint de análisis |
| `@google/genai` | Cliente de Google Gemini para análisis IA |

---

## Tabla de Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/repo-analyzer/analyze` | Analiza un repositorio de GitHub completo |
| `GET` | `/api/repo-analyzer/history` | Retorna los últimos 10 análisis realizados |

---

## 1. POST /api/repo-analyzer/analyze

Analiza un repositorio de GitHub: obtiene metadata, estructura de archivos, dependencias, vulnerabilidades de seguridad, y genera un análisis con inteligencia artificial (Google Gemini).

### Rate Limiting

- **Límite:** 5 solicitudes por día por IP
- **Ventana:** 24 horas deslizantes
- Si se excede el límite, retorna HTTP 429

### Body Request

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `repoUrl` | string | Sí | URL del repositorio de GitHub o formato `owner/repo` |

### Formatos de URL aceptados

```
https://github.com/owner/repo
https://github.com/owner/repo.git
https://github.com/owner/repo/tree/main
owner/repo
```

### Ejemplos de Request

**Con URL completa:**
```bash
curl -X POST http://localhost:3000/api/repo-analyzer/analyze \
  -H "Content-Type: application/json" \
  -d '{"repoUrl": "https://github.com/facebook/react"}'
```

```javascript
fetch('http://localhost:3000/api/repo-analyzer/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ repoUrl: 'https://github.com/facebook/react' })
})
  .then(res => res.json())
  .then(data => console.log(data));
```

**Con formato corto `owner/repo`:**
```bash
curl -X POST http://localhost:3000/api/repo-analyzer/analyze \
  -H "Content-Type: application/json" \
  -d '{"repoUrl": "expressjs/express"}'
```

```javascript
fetch('http://localhost:3000/api/repo-analyzer/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ repoUrl: 'expressjs/express' })
})
  .then(res => res.json())
  .then(data => console.log(data));
```

### Respuesta JSON (Éxito) - 200 OK

```json
{
  "repo": {
    "owner": "facebook",
    "name": "react",
    "description": "The library for web and native user interfaces.",
    "stars": 230000,
    "forks": 47000,
    "language": "JavaScript",
    "license": "MIT",
    "url": "https://github.com/facebook/react",
    "homepage": "https://react.dev",
    "defaultBranch": "main",
    "createdAt": "2013-05-24T16:15:00Z",
    "updatedAt": "2024-06-20T10:30:00Z",
    "pushedAt": "2024-06-20T10:25:00Z",
    "openIssues": 1200,
    "topics": ["javascript", "ui", "frontend"],
    "size": 45000
  },
  "stack": {
    "languages": [
      { "name": "JavaScript", "percentage": 72 },
      { "name": "TypeScript", "percentage": 18 },
      { "name": "HTML", "percentage": 6 },
      { "name": "CSS", "percentage": 4 }
    ],
    "dependencies": {
      "npm": [
        { "name": "react", "version": "18.2.0", "isDev": false },
        { "name": "react-dom", "version": "18.2.0", "isDev": false },
        { "name": "jest", "version": "29.7.0", "isDev": true }
      ],
      "pypi": [],
      "maven": [],
      "go": [],
      "ruby": [],
      "other": []
    }
  },
  "vulnerabilities": [
    {
      "id": "GHSA-xxxx-yyyy-zzzz",
      "summary": "Description of the vulnerability",
      "severity": "high",
      "aliases": ["CVE-2024-12345"],
      "references": ["https://github.com/advisories/GHSA-xxxx-yyyy-zzzz"],
      "fixedVersion": "18.3.0",
      "package": "react-dom",
      "ecosystem": "npm",
      "currentVersion": "18.2.0"
    }
  ],
  "structure": {
    "directories": ["packages", "packages/react", "packages/react-dom", "scripts"],
    "keyFiles": ["package.json", "README.md", "LICENSE", ".gitignore", "tsconfig.json"],
    "totalFiles": 2500
  },
  "analysis": {
    "summary": "React es una biblioteca de UI de Facebook para construir interfaces de usuario con componentes reutilizables. Utiliza un Virtual DOM para renderizado eficiente.",
    "architecture": "Monorepo con workspaces - cada paquete es un módulo independiente dentro de packages/",
    "qualityScore": 92,
    "strengths": [
      "Ecosistema maduro con gran comunidad",
      "Excelente documentación oficial",
      "Testing exhaustivo con cobertura alta",
      "TypeScript completo",
      "Build tools optimizados"
    ],
    "improvements": [
      "Agregar más ejemplos en la documentación de hooks personalizados",
      "Reducir el tamaño del bundle con tree-shaking más agresivo",
      "Mejorar los mensajes de error en desarrollo"
    ],
    "securityConcerns": [
      "Dependencia con versiones antiguas de certain packages"
    ],
    "techStackSummary": {
      "frameworks": ["React", "Next.js"],
      "tools": ["Jest", "Webpack", "TypeScript", "ESLint"],
      "patterns": ["Component-based architecture", "Hooks", "Virtual DOM"]
    },
    "recommendations": [
      "Considerar migrar a React Server Components para mejor performance",
      "Agregar CI/CD pipeline con análisis de dependencias automáticas"
    ]
  },
  "catalogMatches": [
    { "slug": "express", "name": "express", "matchScore": 1.0 },
    { "slug": "react", "name": "react", "matchScore": 1.0 }
  ],
  "analyzedAt": "2024-06-20T14:30:00.000Z",
  "rateLimit": {
    "limit": 5,
    "remaining": 3,
    "resetAt": "2024-06-21T14:30:00.000Z"
  },
  "cached": false
}
```

### Campos de la Respuesta

#### `repo` - Información del repositorio

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `owner` | string | Propietario del repositorio |
| `name` | string | Nombre del repositorio |
| `description` | string | Descripción del repo |
| `stars` | integer | Número de estrellas |
| `forks` | integer | Número de forks |
| `language` | string | Lenguaje principal |
| `license` | string | Licencia (SPDX ID) |
| `url` | string | URL del repositorio |
| `homepage` | string | URL de la página principal (si existe) |
| `defaultBranch` | string | Branch por defecto |
| `createdAt` | string | Fecha de creación (ISO 8601) |
| `updatedAt` | string | Última actualización (ISO 8601) |
| `pushedAt` | string | Último push (ISO 8601) |
| `openIssues` | integer | Issues abiertos |
| `topics` | array[string] | Tags/topics del repositorio |
| `size` | integer | Tamaño en KB |

#### `stack` - Stack tecnológico

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `languages` | array | Lenguajes con porcentaje de uso |
| `languages[].name` | string | Nombre del lenguaje |
| `languages[].percentage` | integer | Porcentaje (0-100) |
| `dependencies` | object | Dependencias agrupadas por ecosistema |

#### `stack.dependencies` - Dependencias agrupadas

| Ecosistema | Origen | Archivos detectados |
|------------|--------|---------------------|
| `npm` | npm/Node.js | `package.json` |
| `pypi` | Python | `requirements.txt`, `pyproject.toml` |
| `maven` | Java | `pom.xml` |
| `go` | Go | `go.mod` |
| `ruby` | Ruby | `Gemfile` |
| `other` | Otros | `composer.json`, `Cargo.toml`, etc. |

Cada dependencia contiene:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `name` | string | Nombre del paquete |
| `version` | string | Versión instalada |
| `isDev` | boolean | `true` si es devDependency |

> **Nota:** Cada grupo de ecosistema está limitado a 100 elementos máximo.

#### `vulnerabilities` - Vulnerabilidades de seguridad

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | string | ID de la vulnerabilidad (ej: GHSA-xxxx) |
| `summary` | string | Descripción de la vulnerabilidad |
| `severity` | string | Severidad: `critical`, `high`, `medium`, `low`, `fixed`, `unknown` |
| `aliases` | array[string] | IDs alternativos (ej: CVE) |
| `references` | array[string] | URLs de referencia |
| `fixedVersion` | string | Versión que corrige la vulnerabilidad (null si no existe) |
| `package` | string | Paquete afectado |
| `ecosystem` | string | Ecosistema del paquete |
| `currentVersion` | string | Versión actual en el proyecto |

#### `structure` - Estructura del repositorio

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `directories` | array[string] | Directorios principales (máx 100) |
| `keyFiles` | array[string] | Archivos importantes detectados |
| `totalFiles` | integer | Total de archivos en el repositorio |

Archivos clave detectados automáticamente:
`package.json`, `requirements.txt`, `pyproject.toml`, `pom.xml`, `build.gradle`, `go.mod`, `Gemfile`, `composer.json`, `Cargo.toml`, `README.md`, `LICENSE`, `.gitignore`, `tsconfig.json`, `webpack.config`, `vite.config`, `docker-compose`, `Dockerfile`, `.env.example`

#### `analysis` - Análisis con IA (Google Gemini)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `summary` | string | Resumen de 2-3 oraciones del proyecto |
| `architecture` | string | Tipo de arquitectura detectada |
| `qualityScore` | integer | Puntuación de calidad (0-100) |
| `strengths` | array[string] | Fortalezas del proyecto (3-5) |
| `improvements` | array[string] | Mejoras sugeridas (3-5) |
| `securityConcerns` | array[string] | Preocupaciones de seguridad |
| `techStackSummary` | object | Resumen del stack tecnológico |
| `techStackSummary.frameworks` | array[string] | Frameworks detectados |
| `techStackSummary.tools` | array[string] | Herramientas detectadas |
| `techStackSummary.patterns` | array[string] | Patrones de arquitectura |
| `recommendations` | array[string] | Recomendaciones accionables (2-3) |

#### `catalogMatches` - Coincidencias con el catálogo

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `slug` | string | Slug de la tecnología en el catálogo |
| `name` | string | Nombre de la tecnología |
| `matchScore` | float | Puntuación de coincidencia (siempre 1.0 si existe) |

Se buscan coincidencias de hasta 30 dependencias contra el catálogo local de tecnologías.

#### `rateLimit` - Información de rate limiting

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `limit` | integer | Límite máximo diario (5) |
| `remaining` | integer | Solicitudes restantes hoy |
| `resetAt` | string | Fecha/hora cuando se reinicia el contador |

#### `cached` - Indicador de caché

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `cached` | boolean | `true` si el resultado viene del caché (24h) |

> Si `cached: true`, el resultado es idéntico al análisis previo del mismo repositorio dentro de las últimas 24 horas.

### Respuesta JSON (Repo privado/inaccesible) - 403 Forbidden

```json
{
  "error": "Repository is private or inaccessible"
}
```

### Respuesta JSON (repoUrl no proporcionado) - 400 Bad Request

```json
{
  "error": "repoUrl is required"
}
```

### Respuesta JSON (URL inválida) - 400 Bad Request

```json
{
  "error": "Invalid GitHub URL format. Use: https://github.com/owner/repo or owner/repo"
}
```

### Respuesta JSON (Rate limit excedido) - 429 Too Many Requests

```json
{
  "error": "Daily analysis limit reached (5 per day). Try again tomorrow."
}
```

---

## 2. GET /api/repo-analyzer/history

Retorna los últimos 10 análisis realizados, ordenados de más reciente a más antiguo.

### Ejemplo de Request

```bash
curl http://localhost:3000/api/repo-analyzer/history
```

```javascript
fetch('http://localhost:3000/api/repo-analyzer/history')
  .then(res => res.json())
  .then(data => console.log(data));
```

### Respuesta JSON (Éxito) - 200 OK

```json
[
  {
    "id": 1,
    "repo_url": "https://github.com/facebook/react",
    "owner": "facebook",
    "repo_name": "react",
    "status": "completed",
    "created_at": "2024-06-20T14:30:00.000Z"
  },
  {
    "id": 2,
    "repo_url": "https://github.com/expressjs/express",
    "owner": "expressjs",
    "repo_name": "express",
    "status": "completed",
    "created_at": "2024-06-20T12:15:00.000Z"
  },
  {
    "id": 3,
    "repo_url": "https://github.com/private-org/secret-repo",
    "owner": "private-org",
    "repo_name": "secret-repo",
    "status": "private",
    "created_at": "2024-06-20T10:00:00.000Z"
  }
]
```

### Campos de la Respuesta

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | integer | ID del análisis |
| `repo_url` | string | URL del repositorio analizado |
| `owner` | string | Propietario del repositorio |
| `repo_name` | string | Nombre del repositorio |
| `status` | string | Estado: `completed`, `pending`, `error`, `private` |
| `created_at` | string | Fecha de creación (ISO 8601) |

### Estados posibles (`status`)

| Estado | Descripción |
|--------|-------------|
| `completed` | Análisis completado exitosamente |
| `pending` | Análisis en progreso |
| `error` | Error durante el análisis |
| `private` | Repositorio privado o inaccesible |

---

## Flujo del Análisis

Cuando se envía un `POST /analyze`, el backend ejecuta estos pasos en orden:

```
1. Parsear la URL del repositorio
       ↓
2. Verificar caché (si existe resultado < 24h, retornarlo)
       ↓
3. Verificar accesibilidad del repo (si es público)
       ↓
4. Guardar estado "pending" en base de datos
       ↓
5. Paralelo: Obtener metadata + árbol de archivos + lenguajes + manifests
       ↓
6. Parsear dependencias de los manifests detectados
       ↓
7. Verificar vulnerabilidades en OSV (Open Source Vulnerabilities)
       ↓
8. Enviar datos a Google Gemini para análisis con IA
       ↓
9. Buscar coincidencias con el catálogo local de tecnologías
       ↓
10. Guardar resultado completo en base de datos (status: "completed")
       ↓
11. Retornar resultado + info de rate limiting
```

### Tiempo de respuesta estimado

| Escenario | Tiempo aproximado |
|-----------|-------------------|
| Caché hit (< 24h) | 100-300ms |
| Repo pequeño (< 50 archivos) | 5-10 segundos |
| Repo mediano (50-500 archivos) | 10-20 segundos |
| Repo grande (> 500 archivos) | 20-40 segundos |

> El tiempo depende de la cantidad de manifests a parsear, dependencias a verificar en OSV, y la respuesta de Gemini.

---

## Formatos de URL Soportados

| Formato | Ejemplo | Válido |
|---------|---------|--------|
| URL completa | `https://github.com/facebook/react` | Sí |
| URL con .git | `https://github.com/facebook/react.git` | Sí |
| URL con branch | `https://github.com/facebook/react/tree/main` | Sí |
| Formato corto | `facebook/react` | Sí |
| URL de otro host | `https://gitlab.com/user/repo` | No |
| URL vacía | `""` | No |

---

## Notas para el Frontend

1. **El análisis toma tiempo.** Mostrar un spinner/loading mientras se procesa. El endpoint responde cuando termina todo el proceso.

2. **El campo `cached: true` indica un resultado缓存ado.** Útil para mostrar un indicador de "resultado缓存ado" al usuario.

3. **El `qualityScore` va de 0 a 100.** Se puede usar para renderizar un gauge o barra de progreso:
   ```javascript
   const getColor = (score) => {
     if (score >= 80) return '#22c55e'; // verde
     if (score >= 60) return '#eab308'; // amarillo
     return '#ef4444'; // rojo
   };
   ```

4. **Las severidades de vulnerabilidad** deben mostrarse con colores:
   ```javascript
   const severityColors = {
     critical: '#dc2626',
     high: '#ea580c',
     medium: '#d97706',
     low: '#65a30d',
     fixed: '#22c55e',
     unknown: '#6b7280'
   };
   ```

5. **El rate limiting** se puede mostrar en la UI:
   ```javascript
   const { limit, remaining, resetAt } = response.rateLimit;
   console.log(`Te quedan ${remaining} de ${limit} análisis hoy`);
   ```

6. **El endpoint `GET /history`** es útil para mostrar un leaderboard o historial de análisis recientes.

7. **Los `catalogMatches`** muestran qué dependencias del proyecto están en tu catálogo de tecnologías. Se puede usar para crear links directos a la página de detalle de cada tecnología.

8. **El endpoint puede fallar** por rate limit de GitHub API, timeout de Gemini, o errores de OSV. Siempre mostrar un mensaje de error amigable.

---

## Variables de Entorno para Render

Si despliega en Render, agregar estas variables adicionales:

| Variable | Valor | Notas |
|----------|-------|-------|
| `GITHUB_TOKEN` | Token de GitHub | Para evitar rate limit de la API de GitHub |
| `GEMINI_API_KEY` | API Key de Gemini | Para el análisis con IA |

> Sin `GITHUB_TOKEN`, la API de GitHub limita a 60 requests/hora. Con token, el límite es 5000/hora.

> Sin `GEMINI_API_KEY`, el análisis de IA fallará pero el resto del endpoint funcionará (analysis vendrá con datos por defecto).
