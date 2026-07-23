# Guía de proyecto: Directorio interactivo de APIs, Frameworks y Librerías + Analizador de Repos

## 1. Visión general del sistema

El proyecto tiene realmente **tres módulos independientes** que luego se integran:

1. **Catálogo/buscador** de APIs, frameworks y librerías (con ficha, docs y ejemplos interactivos).
2. **Playground interactivo** para probar endpoints de APIs en distintos lenguajes ("try it out" estilo Swagger/RapidAPI).
3. **Analizador de repositorios Git**: recibe una URL pública, detecta el stack tecnológico, y genera recomendaciones de uso.

Te conviene tratarlos como servicios separados dentro del mismo backend Express (o incluso microservicios si crece), porque tienen fuentes de datos y lógicas muy distintas.

---

## 2. Módulo 1: Catálogo de APIs, frameworks y librerías

### 2.1 De dónde sacar la información (sin inventar/mantener todo a mano)

No necesitas escribir tú cada ficha. Puedes **agregar** datos de fuentes existentes vía API/scraping legal:

| Tipo | Fuente | Qué te da |
|---|---|---|
| APIs públicas | [APIs.guru](https://apis.guru) (tiene API propia, formato OpenAPI) | Miles de specs OpenAPI/Swagger ya estructuradas |
| APIs públicas | [Public APIs list (GitHub)](https://github.com/public-apis/public-apis) | JSON con categoría, auth, HTTPS, CORS |
| Librerías JS/Node | **npm Registry API** (`registry.npmjs.org`) | Descripción, versión, README, dependencias, descargas |
| Librerías Python | **PyPI JSON API** (`pypi.org/pypi/<pkg>/json`) | Igual que npm pero para Python |
| Frameworks/repos en general | **GitHub REST API / GraphQL API** | Stars, topics, README, lenguaje principal, licencia |
| Documentación oficial | Scraping puntual (con permiso/robots.txt) o enlazar directo | Para no reinventar docs ya buenas |

**Estrategia recomendada:** en vez de scrapear todo, usa estas APIs para **poblar tu base de datos automáticamente** con un job (cron) que:
- Trae metadata básica (nombre, descripción, categoría, links, stats).
- Guarda el README/documentación como texto para indexar búsqueda.
- Si es una API con spec **OpenAPI/Swagger**, guarda el spec completo — de ahí vas a generar los ejemplos interactivos casi gratis (ver 2.3).

Esto te da un catálogo con miles de entradas desde el día 1, sin escribir fichas manualmente. Las fichas "curadas a mano" las puedes reservar para las tecnologías más populares (React, Express, Stripe API, etc.), donde sí vale la pena un ejemplo hecho por ti.

### 2.2 Modelo de datos (ejemplo simplificado)

```
Tecnologia
 - id
 - nombre
 - tipo (api | framework | libreria)
 - lenguaje(s)
 - categoria (auth, pagos, mapas, ui, testing, etc.)
 - descripcion_corta
 - descripcion_larga (markdown)
 - repo_url
 - docs_url
 - openapi_spec_url (si aplica, para APIs)
 - stats { stars, downloads_semana, ultima_actualizacion }
 - tags []
 - ejemplos [] -> relación con tabla Ejemplo

Ejemplo
 - id
 - tecnologia_id
 - lenguaje (js, python, curl, go...)
 - titulo
 - codigo
 - descripcion
 - endpoint_relacionado (si es de una API)
```

### 2.3 Ejemplos interactivos: cómo lo resuelves técnicamente

Aquí es donde está el verdadero "truco" del proyecto — no necesitas escribir a mano el ejemplo para cada endpoint en cada lenguaje.

**Para APIs (lo más pesado):**
1. Si la API tiene spec **OpenAPI/Swagger**, puedes usar librerías que generan automáticamente snippets de código en múltiples lenguajes a partir de la definición del endpoint:
   - [`httpsnippet`](https://github.com/Kong/httpsnippet) (Node): a partir de una request HTTP genera código en curl, JS (fetch/axios), Python (requests), PHP, Go, Java, etc. **Esto resuelve el 80% del trabajo de "ejemplos en distintos lenguajes" automáticamente.**
   - Puedes embeber un cliente tipo **Swagger UI** o **Redoc** (son componentes open source) para renderizar la documentación interactiva de una API que tenga spec OpenAPI, con botón "Try it out" ya incluido.
2. Para que el "probar en vivo" funcione sin problemas de CORS, tu backend puede actuar como **proxy**: el usuario arma la request en tu UI, tu backend la reenvía al API real y devuelve la respuesta (importante por seguridad, ver reglas de negocio más abajo).

**Para librerías/frameworks (sin endpoints HTTP):**
- Aquí sí conviene un **playground de código ejecutable en el navegador**, no en tu servidor:
  - JS/TS: [Sandpack](https://sandpack.codesandbox.io/) o [StackBlitz WebContainers](https://webcontainers.io/) — corren Node/npm packages *dentro del navegador*, sin que tu servidor ejecute nada (más seguro y barato).
  - Python: [Pyodide](https://pyodide.org/) (Python compilado a WebAssembly, corre en el navegador).
- Si quieres ejecutar código en el servidor (más lenguajes, más control) necesitas un **sandbox aislado** (Docker containers efímeros, o servicios como Judge0/Piston API) — pero esto es más caro y riesgoso en seguridad. Te recomiendo empezar con ejecución en el navegador (Sandpack/Pyodide) y añadir sandbox server-side después si hace falta.

---

## 3. Módulo 2: Analizador de repositorios Git

### 3.1 Flujo

1. Usuario pega URL pública (GitHub/GitLab).
2. Backend usa la **API de GitHub** (`GET /repos/{owner}/{repo}` + `GET /repos/{owner}/{repo}/contents`) para:
   - Leer `package.json`, `requirements.txt`, `pom.xml`, `go.mod`, `Gemfile`, `composer.json`, etc. → de ahí sacas **exactamente** qué librerías/frameworks usa y en qué versión.
   - Leer `README.md`.
   - Usar el endpoint de **languages** de GitHub para el desglose de lenguajes.
3. Con la lista de dependencias detectadas, **cruzas contra tu propio catálogo** (Módulo 1) — así puedes decir "este proyecto usa Express 4.18, aquí tienes su ficha, docs y ejemplos".
4. Para "cómo lo usan" (no solo qué usan): puedes hacer un análisis más fino buscando imports/requires en los archivos fuente (regex simple por lenguaje, o AST parsing con librerías como `@babel/parser` para JS) para detectar **patrones de uso reales** (ej. "usan Express con middleware de autenticación JWT").
5. Para "cómo implementarlo en casos específicos que el usuario necesite": esta parte es la más interesante y probablemente donde quieras meter **un LLM** (API de Claude, por ejemplo) — le pasas el contexto (dependencias detectadas + fragmentos relevantes del código + la necesidad del usuario) y le pides que genere una recomendación/código de ejemplo específico. Hacer esto "a mano" con reglas fijas sería inviable dada la variedad de casos.

### 3.2 Cuidado técnico importante
- No clones el repo completo en tu servidor sin límites — puede ser enorme. Usa la API de contenidos de GitHub para traer solo los archivos de manifiesto (package.json, etc.) y, si necesitas más profundidad, limita a una descarga superficial (`git clone --depth=1`) en un contenedor efímero con timeout y límite de tamaño.
- Respeta rate limits de la API de GitHub (60 req/hora sin auth, 5000/hora con token — necesitarás un token de app registrado).

---

## 4. Diseño del backend (Node.js + Express)

### 4.1 Estructura de carpetas sugerida

```
/src
  /modules
    /catalog       -> CRUD y búsqueda de tecnologías
    /examples      -> generación/gestión de ejemplos
    /repo-analyzer -> análisis de repos git
    /proxy         -> proxy seguro para probar APIs en vivo
  /jobs            -> cron jobs que sincronizan npm/PyPI/GitHub
  /services        -> clientes externos (github.js, npm.js, pypi.js, openai/claude.js)
  /models          -> esquemas de base de datos
  /middlewares     -> auth, rate-limit, validación
  /routes
```

### 4.2 Endpoints principales

**Catálogo**
- `GET /api/technologies?query=&type=&category=&lang=` — búsqueda con filtros
- `GET /api/technologies/:id` — ficha completa
- `GET /api/technologies/:id/examples?lang=js` — ejemplos filtrados por lenguaje
- `POST /api/technologies` (admin) — alta manual/curada

**Ejemplos interactivos de APIs**
- `GET /api/technologies/:id/openapi` — devuelve el spec OpenAPI guardado
- `POST /api/proxy/try` — recibe `{ technologyId, endpoint, method, headers, body }`, reenvía la request real y devuelve la respuesta (con validaciones estrictas, ver reglas de negocio)
- `GET /api/technologies/:id/snippet?lang=python&endpoint=/users` — genera snippet de código con httpsnippet

**Analizador de repos**
- `POST /api/repo-analyzer/analyze` — recibe `{ repoUrl }`, devuelve job id (análisis asíncrono si el repo es grande)
- `GET /api/repo-analyzer/status/:jobId` — estado del análisis
- `GET /api/repo-analyzer/result/:jobId` — resultado: stack detectado, versiones, fichas relacionadas del catálogo
- `POST /api/repo-analyzer/recommend` — recibe `{ jobId, userNeed: "quiero agregar autenticación con JWT" }` → devuelve recomendación específica (posiblemente vía LLM)

**Sync interno (jobs, no expuesto públicamente o solo admin)**
- `POST /api/admin/sync/npm`
- `POST /api/admin/sync/apis-guru`

### 4.3 Autenticación/usuarios (si quieres favoritos, historial, etc.)
- JWT simple + refresh tokens, o usar algo como Auth0/Clerk si no quieres construirlo tú mismo al inicio.

---

## 5. Reglas de negocio a definir

1. **Límite de uso del proxy de "probar en vivo"**: para evitar que tu servidor sea usado como proxy anónimo para atacar APIs de terceros, exige:
   - Rate limiting por usuario/IP.
   - Whitelist de dominios permitidos (solo APIs que están en tu catálogo, no cualquier URL arbitraria).
   - No permitir que el usuario meta sus propias API keys de terceros y que tu servidor las almacene sin cifrar (si lo permites, cifra en reposo y no las loguees).

2. **Frescura de datos**: define cada cuánto se re-sincronizan los datos de npm/PyPI/GitHub (ej. diario para stats, semanal para specs completas) para no golpear rate limits ni mostrar info desactualizada.

3. **Curaduría vs. auto-generado**: marca claramente en la ficha si el contenido es "generado automáticamente" o "curado/verificado", para que el usuario sepa qué tan confiable es el ejemplo.

4. **Límites en el analizador de repos**:
   - Tamaño máximo de repo a analizar (por número de archivos o MB).
   - Timeout máximo de análisis.
   - Solo repos públicos (nunca pedir tokens de acceso a repos privados de terceros, por seguridad y legalidad).

5. **Uso del LLM para recomendaciones** (si lo integras): define un límite de tokens/costo por usuario/día, y deja claro al usuario que es una sugerencia generada por IA, no documentación oficial.

6. **Licencias**: al mostrar código de ejemplo extraído de repos de terceros, respeta la licencia del repo original (muéstralo como referencia con atribución, no como si fuera tuyo).

7. **Caché**: cachea agresivamente resultados de análisis de repos (por hash del último commit) y de búsquedas del catálogo, para no re-consultar APIs externas innecesariamente (Redis es buena opción aquí).

---

## 6. Stack técnico recomendado (resumen)

| Capa | Recomendación |
|---|---|
| Backend | Node.js + Express (o Fastify si quieres más performance) |
| Base de datos principal | PostgreSQL (relacional, bueno para catálogo estructurado) |
| Búsqueda | Meilisearch o Elasticsearch (para autocompletado/búsqueda difusa rápida) — Postgres full-text search también sirve para empezar |
| Caché/colas | Redis (+ BullMQ para jobs asíncronos como el análisis de repos) |
| Docs interactivas de API | Swagger UI / Redoc embebido |
| Playground de código | Sandpack (JS) / Pyodide (Python) |
| Generación de snippets multi-lenguaje | httpsnippet |
| Análisis de repos | Octokit (cliente oficial de GitHub API) |
| Recomendaciones específicas | API de Claude (Anthropic) u otro LLM |
| Frontend | React (combina bien con Sandpack) |

---

## 7. Orden sugerido de construcción (MVP incremental)

1. Backend + BD + sync con npm registry (empieza solo con librerías JS, es lo más simple).
2. Endpoint de búsqueda + frontend básico de catálogo.
3. Suma sync con GitHub API (stars, README, topics) para enriquecer fichas.
4. Suma APIs.guru para las APIs públicas con spec OpenAPI + Swagger UI embebido.
5. Analizador de repos: primero solo detectar dependencias (package.json), sin IA todavía.
6. Snippets multi-lenguaje con httpsnippet.
7. Playground ejecutable con Sandpack.
8. Integración de LLM para recomendaciones específicas del analizador de repos.

Esto te permite tener algo demostrable muy rápido (pasos 1-3) y añadir la parte más compleja (ejecución interactiva, análisis con IA) de forma incremental.
