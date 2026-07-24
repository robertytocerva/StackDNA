# Probador de APIs AWS — Documentacion

## Que es

Es un mini Postman integrado en StackDNA que permite probar 20 servicios de AWS directamente desde el navegador. El usuario introduce sus credenciales temporales, elige un servicio, y recibe la respuesta real de la API de AWS en tiempo real.

La aplicacion se compone de dos partes:

- **Frontend** — Astro (puerto 4321)
- **Backend** — Express (puerto 3001)

---

## Arquitectura general

```
┌─────────────────────────────────────┐
│  NAVEGADOR (localhost:4321)         │
│                                     │
│  /servicios                         │
│  ┌───────────────────────────────┐  │
│  │ Filters: busqueda + GET/POST  │  │
│  │ Grid: 20 tarjetas ApiCard     │  │
│  │ Cada tarjeta tiene:           │  │
│  │   - Textarea con payload JSON │  │
│  │   - Boton EJECUTAR            │  │
│  │   - Panel de respuesta        │  │
│  └───────────────────────────────┘  │
│           │                         │
│           │ POST /api/aws/call      │
│           │ Body: { service,        │
│           │   accessKeyId,          │
│           │   secretAccessKey,      │
│           │   region }              │
│           ▼                         │
└─────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│  BACKEND EXPRESS (localhost:3001)   │
│                                     │
│  1. Helmet (headers seguridad)      │
│  2. CORS (solo acepta 4321)         │
│  3. Rate Limit global (100/15min)   │
│  4. Rate Limit AWS (10/1min)        │
│  5. Validacion Zod (formato keys)   │
│  6. Llamada a AWS SDK con las creds │
│  7. Respuesta JSON al frontend      │
│                                     │
│  Las keys NUNCA se loguean ni       │
│  se guardan en ningun lado.         │
└─────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│  AWS (la region que elija el user)  │
│  Operaciones de solo lectura:       │
│  List*, Describe*, Get*             │
└─────────────────────────────────────┘
```

---

## Como levantar el proyecto

### Backend

```bash
cd backServices
npm install
npm start
```

El servidor arranca en `http://localhost:3001`. Verifica con:

```bash
curl http://localhost:3001/health
# Respuesta: {"status":"ok"}
```

### Frontend

```bash
cd front
npm install
npx astro dev
```

El sitio corre en `http://localhost:4321`. La pagina del probador esta en `/servicios`.

---

## Estructura de archivos relevante

```
backServices/
├── src/
│   ├── server.js                    ← Entry point Express
│   ├── routes/
│   │   ├── aws.js                   ← POST /api/aws/call
│   │   └── execute.js               ← Ruta legacy (no tocar)
│   ├── controllers/
│   │   └── awsController.js         ← Dispatcher: recibe service y llama al handler
│   ├── middleware/
│   │   ├── security.js              ← Regex de keys, regiones y servicios validos
│   │   ├── validate.js              ← Validacion Zod del payload
│   │   └── rateLimit.js             ← Limites de peticiones por IP
│   └── services/
│       ├── awsReadConfig.js          ← Fabrica de config para AWS SDK
│       ├── sts.js                    ← STS: GetCallerIdentity
│       ├── eventbridgeRead.js        ← EventBridge: ListEventBuses
│       ├── cloudformationRead.js     ← CloudFormation: ListStacks
│       ├── ssmRead.js                ← SSM: DescribeParameters
│       ├── kmsRead.js                ← KMS: ListKeys
│       ├── stepfunctionsRead.js      ← Step Functions: ListStateMachines
│       ├── ecrRead.js                ← ECR: DescribeRepositories
│       ├── appconfigRead.js          ← AppConfig: ListApplications
│       ├── xrayRead.js               ← X-Ray: GetGroups
│       ├── cognitoPools.js           ← Cognito: ListUserPools
│       ├── s3Read.js                 ← S3: ListBuckets
│       ├── ec2Read.js                ← EC2: DescribeInstances
│       ├── lambdaRead.js             ← Lambda: ListFunctions
│       ├── dynamodbRead.js           ← DynamoDB: ListTables
│       ├── apigatewayRead.js         ← API Gateway: GetRestApis
│       ├── snsRead.js                ← SNS: ListTopics
│       ├── sqsRead.js                ← SQS: ListQueues
│       ├── iamRead.js                ← IAM: ListUsers
│       ├── cloudwatchRead.js         ← CloudWatch: DescribeAlarms
│       └── secretsmanagerRead.js     ← Secrets Manager: ListSecrets
└── .env.example                      ← Variables de entorno

front/
├── src/
│   ├── data/
│   │   └── services.ts              ← Array con los 20 servicios (fuente de verdad)
│   ├── scripts/
│   │   └── apiTester.ts             ← Logica cliente: filtros, fetch, render respuesta
│   ├── components/ApiTester/
│   │   ├── ApiCard.astro            ← Tarjeta individual de cada servicio
│   │   ├── Filters.astro            ← Barra busqueda + botones GET/POST
│   │   ├── Grid.astro               ← Contenedor grid de tarjetas
│   │   └── Header.astro             ← Header de la seccion
│   ├── pages/
│   │   ├── servicios.astro          ← Pagina principal del probador
│   │   └── terms.astro              ← Terminos de uso
│   └── styles/
│       └── servicios.css            ← Estilos del probador
```

---

## Los 20 servicios AWS soportados

### Servicios de Erick (10)

| ID | Servicio | Metodo | Accion AWS |
|---|---|---|---|
| `sts` | AWS STS | POST | GetCallerIdentity |
| `eventbridge` | Amazon EventBridge | POST | ListEventBuses |
| `cloudformation` | AWS CloudFormation | POST | ListStacks |
| `ssm` | AWS Systems Manager | POST | DescribeParameters |
| `kms` | AWS KMS | POST | ListKeys |
| `stepfunctions` | AWS Step Functions | POST | ListStateMachines |
| `ecr` | Amazon ECR | POST | DescribeRepositories |
| `appconfig` | AWS AppConfig | GET | ListApplications |
| `xray` | AWS X-Ray | POST | GetGroups |
| `cognito` | Amazon Cognito | POST | ListUserPools |

### Servicios del companero (10)

| ID | Servicio | Metodo | Accion AWS |
|---|---|---|---|
| `s3` | Amazon S3 | GET | ListBuckets |
| `ec2` | Amazon EC2 | POST | DescribeInstances |
| `lambda` | AWS Lambda | GET | ListFunctions |
| `dynamodb` | Amazon DynamoDB | POST | ListTables |
| `apigateway` | Amazon API Gateway | GET | GetRestApis |
| `sns` | Amazon SNS | POST | ListTopics |
| `sqs` | Amazon SQS | GET | ListQueues |
| `iam` | AWS IAM | GET | ListUsers |
| `cloudwatch` | Amazon CloudWatch | POST | DescribeAlarms |
| `secretsmanager` | AWS Secrets Manager | POST | ListSecrets |

### Distribucion por metodo HTTP

- **GET (6):** s3, lambda, apigateway, sqs, iam, appconfig
- **POST (14):** sts, eventbridge, cloudformation, ssm, kms, stepfunctions, ecr, xray, cognito, ec2, dynamodb, sns, cloudwatch, secretsmanager

> El badge GET/POST en la tarjeta indica el metodo que AWS usa internamente. Todas las llamadas del frontend al backend siempre van por `POST /api/aws/call`.

---

## Endpoint del backend

### `POST /api/aws/call`

**Request:**

```json
{
  "service": "sts",
  "accessKeyId": "AKIA...",
  "secretAccessKey": "...",
  "region": "us-east-2"
}
```

**Campos requeridos:**

| Campo | Tipo | Descripcion |
|---|---|---|
| `service` | string | ID del servicio (ver tabla arriba) |
| `accessKeyId` | string | AWS Access Key (formato AKIA + 16 chars) |
| `secretAccessKey` | string | AWS Secret Key (40 chars) |
| `region` | string | Region AWS valida |

**Campos opcionales:**

| Campo | Tipo | Descripcion |
|---|---|---|
| `sessionToken` | string | Token de sesion (para credenciales temporales) |

**Respuesta exitosa (200):**

```json
{
  "status": 200,
  "message": "Conexión exitosa",
  "service": "sts",
  "region": "us-east-2",
  "data": {
    "userId": "AIDA...",
    "account": "123456789012",
    "arn": "arn:aws:iam::123456789012:user/dev"
  }
}
```

**Respuesta de error (4xx/5xx):**

```json
{
  "status": 403,
  "service": "sts",
  "error": "InvalidClientTokenId",
  "message": "The security token included in the request is invalid."
}
```

### `GET /health`

Devuelve `{"status":"ok"}` si el servidor esta funcionando.

---

## Regiones validas

```
us-east-1, us-east-2, us-west-1, us-west-2,
eu-west-1, eu-central-1, ap-southeast-1,
ap-northeast-1, sa-east-1
```

---

## Seguridad

### Credenciales

- Las credenciales AWS se envian en el body de cada peticion.
- **Nunca** se guardan en disco, base de datos, ni variables de entorno del servidor.
- **Nunca** se incluyen en los logs del servidor (se sanitizan).
- **Nunca** se devuelven en la respuesta JSON.
- Si un error de AWS contiene la key en el mensaje, se redacta automaticamente con `[REDACTED_ACCESS_KEY]`.

### Validacion

El middleware de validacion (Zod) verifica:

1. Content-Type sea `application/json`
2. Los 4 campos requeridos esten presentes
3. El Access Key tenga formato `AKIA` + 16 caracteres alfanumericos
4. El Secret Key tenga 40 caracteres validos
5. La region este en la lista blanca
6. El servicio este en la lista blanca de 20 servicios

Si alguna validacion falla, se rechaza la peticion con un 400 descriptivo sin ejecutar nada contra AWS.

### Rate Limiting

| Limite | Ventana | Maximo |
|---|---|---|
| Global | 15 minutos | 100 peticiones por IP |
| AWS (endpoint /api/aws/call) | 1 minuto | 10 peticiones por IP |

### Headers de seguridad

Se usa `helmet` que agrega automaticamente: X-Content-Type-Options, Strict-Transport-Security, X-Frame-Options, etc.

### CORS

Solo se aceptan peticiones desde el origen del frontend (`http://localhost:4321` en desarrollo). En produccion se cambia la variable `FRONTEND_URL` en el `.env`.

---

## Como funciona el frontend

### Flujo del usuario

1. El usuario entra a `/servicios`
2. Ve 20 tarjetas con los servicios AWS
3. Puede filtrar por nombre (barra de busqueda) o por metodo (botones GET/POST)
4. Cada tarjeta tiene un textarea con un payload JSON de ejemplo
5. El usuario pone sus credenciales AWS reales en el JSON
6. Hace click en "EJECUTAR PETICION"
7. El frontend envia el JSON al backend via `POST /api/aws/call`
8. La respuesta aparece en verde (200) o rojo (error)

### Archivo `services.ts`

Es la fuente de verdad de los 20 servicios. Cada servicio tiene:

```typescript
interface AWSService {
  id: string;          // ID unico usado como clave en el backend
  name: string;        // Nombre visible en la tarjeta
  method: 'GET' | 'POST';  // Metodo HTTP que usa AWS (informativo)
  endpoint: string;    // URL oficial del servicio en AWS
  description: string; // Descripcion corta
  action: string;      // Accion de AWS que se ejecuta
  docsUrl: string;     // Link a la documentacion oficial
  payloadExample: Record<string, string>;  // JSON de ejemplo para el textarea
  owner: 'erick' | 'compañero';  // Quien desarrollo el handler
}
```

### Archivo `apiTester.ts`

Controla toda la interactividad:

- `bindFilters()` — Escucha la barra de busqueda y los botones GET/POST/Todos
- `applyFilters()` — Muestra/oculta tarjetas segun el filtro activo
- `bindRequests()` — Captura el click en EJECUTAR y hace el fetch
- `setResponse()` — Renderiza la respuesta con color verde/rojo/loading
- `parsePayload()` — Valida que el JSON del textarea sea valido antes de enviar

---

## Como agregar un nuevo servicio

### 1. Backend: crear el handler

Crea un archivo en `backServices/src/services/nuevoServicioRead.js`:

```javascript
const { NuevoClient, AlgunComando } = require("@aws-sdk/client-nuevo");
const { createAwsReadConfig } = require("./awsReadConfig");

module.exports = async ({ credentials, region }) => {
    const client = new NuevoClient(createAwsReadConfig({ ...credentials, region }));
    const response = await client.send(new AlgunComando({}));
    return { datos: response.LoQueNecesites || [] };
};
```

### 2. Backend: registrar en el controlador

En `backServices/src/controllers/awsController.js` agrega:

```javascript
const callNuevo = require("../services/nuevoServicioRead");

// En SERVICE_MAP:
const SERVICE_MAP = {
    // ...existentes...
    nuevoservicio: callNuevo
};
```

### 3. Backend: agregar a la lista blanca

En `backServices/src/middleware/security.js` agrega el ID al array `VALID_SERVICES`:

```javascript
const VALID_SERVICES = [
    // ...existentes...
    "nuevoservicio"
];
```

### 4. Frontend: agregar al array de servicios

En `front/src/data/services.ts` agrega un nuevo objeto al array `AWS_SERVICES`:

```typescript
{
    id: 'nuevoservicio',
    name: 'AWS Nuevo Servicio',
    method: 'POST',
    endpoint: 'https://nuevoservicio.{region}.amazonaws.com/',
    description: 'Descripcion de lo que hace',
    action: 'NombreDeLaAccion',
    docsUrl: 'https://docs.aws.amazon.com/...',
    owner: 'tu-nombre',
    payloadExample: {
        service: 'nuevoservicio',
        accessKeyId: 'PON_AQUI_TU_ACCESS_KEY_ID',
        secretAccessKey: 'PON_AQUI_TU_SECRET_ACCESS_KEY',
        region: 'us-east-2',
    },
},
```

### 5. Frontend: actualizar los filtros

En `front/src/components/ApiTester/Filters.astro` actualiza los conteos en los botones:

```html
<button data-filter="ALL">Todos (21)</button>
<button data-filter="GET">GET (6)</button>  <!-- o 7 si es GET -->
<button data-filter="POST">POST (15)</button>  <!-- o ajustar -->
```

### 6. Instalar la dependencia de AWS SDK

```bash
cd backServices
npm install @aws-sdk/client-nuevo
```

---

## Variables de entorno

Archivo: `backServices/.env`

```env
PORT=3001
FRONTEND_URL=http://localhost:4321
```

En produccion, cambia `FRONTEND_URL` al dominio real del frontend.

Las credenciales AWS **no** van aqui. Las envia el usuario en cada peticion.

---

## Errores comunes

| Sintoma | Causa | Solucion |
|---|---|---|
| "Error de red" en rojo | Backend no esta corriendo | Ejecuta `npm start` en backServices |
| "Servicio no soportado" | El ID del servicio no esta en VALID_SERVICES | Agrega el ID a security.js |
| "Formato de Access Key invalido" | La key no empieza con AKIA o no tiene 20 chars | Verifica que sea una key real |
| "Region AWS no valida" | La region no esta en la lista blanca | Agrega la region a VALID_REGIONS en security.js |
| "Limite de llamadas AWS alcanzado" | Mas de 10 peticiones en 1 minuto | Espera 60 segundos |
| Respuesta 403 de AWS | Las credenciales no tienen permiso para esa accion | Verifica los permisos IAM de la key |
| "JSON invalido" (sin llamar al backend) | El textarea tiene JSON mal formado | Revisa comas, comillas y llaves |

---

## Notas importantes

- Todas las operaciones son de **solo lectura** (List, Describe, Get). No se modifica nada en la cuenta AWS del usuario.
- El badge GET/POST en las tarjetas es informativo (el metodo que usa AWS en su API REST). El frontend siempre envia POST al backend.
- La ruta `/execute` en el backend es legacy de una version anterior. No la borren, pero usen `/api/aws/call` para el probador.
- La pagina `/terms` contiene los terminos basicos de uso. El link esta en el footer.
