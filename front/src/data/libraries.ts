export type LibraryCategory = string;

export interface LibrarySnippet {
	title: string;
	code: string;
	output: string;
	language: 'python' | 'javascript' | 'java';
}

export interface LibraryEntry {
	id: string;
	language: string;
	languageIcon: string;
	isPopular: boolean;
	library: {
		name: string;
		description: string;
		isPopular: boolean;
		category: LibraryCategory;
		installCommand: string;
		docsUrl: string;
	};
	snippets: LibrarySnippet[];
}

export const libraries: LibraryEntry[] = [
	{
		id: 'python-math',
		language: 'Python',
		languageIcon: '🐍',
		isPopular: true,
		library: {
			name: 'math',
			description: 'Funciones matemáticas para cálculos con precisión y trigonometría.',
			isPopular: true,
			category: 'math',
			installCommand: 'built-in',
			docsUrl: 'https://docs.python.org/3/library/math.html',
		},
		snippets: [
			{
				title: 'Calcular la hipotenusa de un triángulo',
				code: `import math

width = 3
height = 4
result = math.hypot(width, height)
print(result)`,
				output: '5.0',
				language: 'python',
			},
			{
				title: 'Obtener el factorial de un número',
				code: `import math

number = 5
result = math.factorial(number)
print(f"{number}! = {result}")`,
				output: '5! = 120',
				language: 'python',
			},
		],
	},
	{
		id: 'python-os',
		language: 'Python',
		languageIcon: '🐍',
		isPopular: true,
		library: {
			name: 'os',
			description: 'Acceso portable a rutas, variables de entorno y operaciones del sistema.',
			isPopular: true,
			category: 'system',
			installCommand: 'built-in',
			docsUrl: 'https://docs.python.org/3/library/os.html',
		},
		snippets: [
			{
				title: 'Construir una ruta portable',
				code: `import os

parts = ("src", "data", "config.json")
path = os.path.join(*parts)
print(path.replace(os.sep, "/"))`,
				output: 'src/data/config.json',
				language: 'python',
			},
			{
				title: 'Separar nombre y extensión',
				code: `import os

filename = "report.final.pdf"
name, extension = os.path.splitext(filename)
print(name)
print(extension)`,
				output: 'report.final\n.pdf',
				language: 'python',
			},
		],
	},
	{
		id: 'python-json',
		language: 'Python',
		languageIcon: '🐍',
		isPopular: true,
		library: {
			name: 'json',
			description: 'Serializa y deserializa datos entre objetos Python y documentos JSON.',
			isPopular: true,
			category: 'data',
			installCommand: 'built-in',
			docsUrl: 'https://docs.python.org/3/library/json.html',
		},
		snippets: [
			{
				title: 'Convertir un objeto a JSON ordenado',
				code: `import json

profile = {"name": "Ada", "active": True}
payload = json.dumps(profile, sort_keys=True)
print(payload)`,
				output: '{"active": true, "name": "Ada"}',
				language: 'python',
			},
			{
				title: 'Leer valores desde un JSON',
				code: `import json

payload = '{"language": "Python", "version": 3}'
data = json.loads(payload)
print(data["language"])
print(data["version"])`,
				output: 'Python\n3',
				language: 'python',
			},
		],
	},
	{
		id: 'python-datetime',
		language: 'Python',
		languageIcon: '🐍',
		isPopular: true,
		library: {
			name: 'datetime',
			description: 'Trabaja con fechas, horas, zonas temporales y diferencias de tiempo.',
			isPopular: true,
			category: 'datetime',
			installCommand: 'built-in',
			docsUrl: 'https://docs.python.org/3/library/datetime.html',
		},
		snippets: [
			{
				title: 'Calcular días entre dos fechas',
				code: `from datetime import date

start = date(2026, 1, 1)
end = date(2026, 1, 10)
print((end - start).days)`,
				output: '9',
				language: 'python',
			},
			{
				title: 'Formatear una fecha y hora',
				code: `from datetime import datetime

moment = datetime(2026, 7, 22, 14, 30)
formatted = moment.strftime("%Y-%m-%d %H:%M")
print(formatted)`,
				output: '2026-07-22 14:30',
				language: 'python',
			},
		],
	},
	{
		id: 'python-random',
		language: 'Python',
		languageIcon: '🐍',
		isPopular: true,
		library: {
			name: 'random',
			description: 'Genera valores pseudoaleatorios para simulaciones, pruebas y selecciones.',
			isPopular: true,
			category: 'utilities',
			installCommand: 'built-in',
			docsUrl: 'https://docs.python.org/3/library/random.html',
		},
		snippets: [
			{
				title: 'Generar un valor reproducible',
				code: `import random

random.seed(7)
value = random.random()
print(round(value, 4))`,
				output: '0.3238',
				language: 'python',
			},
			{
				title: 'Elegir un elemento al azar',
				code: `import random

random.seed(7)
colors = ["purple", "cyan", "green"]
print(random.choice(colors))`,
				output: 'cyan',
				language: 'python',
			},
		],
	},
	{
		id: 'javascript-lodash',
		language: 'JavaScript',
		languageIcon: '🟨',
		isPopular: true,
		library: {
			name: 'lodash',
			description: 'Colección de utilidades para trabajar con arrays, objetos y valores JavaScript.',
			isPopular: true,
			category: 'utilities',
			installCommand: 'npm install lodash',
			docsUrl: 'https://lodash.com/docs/',
		},
		snippets: [
			{
				title: 'Dividir una lista en grupos',
				code: `import _ from "lodash";

const values = [1, 2, 3, 4, 5];
const groups = _.chunk(values, 2);
console.log(JSON.stringify(groups));`,
				output: '[[1,2],[3,4],[5]]',
				language: 'javascript',
			},
			{
				title: 'Eliminar valores duplicados',
				code: `import _ from "lodash";

const tags = ["ui", "api", "ui", "data"];
const uniqueTags = _.uniq(tags);
console.log(uniqueTags.join(", "));`,
				output: 'ui, api, data',
				language: 'javascript',
			},
		],
	},
	{
		id: 'javascript-axios',
		language: 'JavaScript',
		languageIcon: '🟨',
		isPopular: true,
		library: {
			name: 'axios',
			description: 'Cliente HTTP basado en promesas para navegador y Node.js.',
			isPopular: true,
			category: 'networking',
			installCommand: 'npm install axios',
			docsUrl: 'https://axios-http.com/docs/intro',
		},
		snippets: [
			{
				title: 'Construir una URL con parámetros',
				code: `import axios from "axios";

const url = axios.getUri({
  baseURL: "https://api.example.com",
  url: "/users",
  params: { page: 2, limit: 10 },
});
console.log(url);`,
				output: 'https://api.example.com/users?page=2&limit=10',
				language: 'javascript',
			},
			{
				title: 'Crear un cliente HTTP reutilizable',
				code: `import axios from "axios";

const client = axios.create({
  baseURL: "https://api.example.com",
});
console.log(client.defaults.baseURL);
console.log(client.defaults.timeout);`,
				output: 'https://api.example.com\n0',
				language: 'javascript',
			},
		],
	},
	{
		id: 'javascript-date-fns',
		language: 'JavaScript',
		languageIcon: '🟨',
		isPopular: true,
		library: {
			name: 'date-fns',
			description: 'Funciones modulares y ligeras para manipular fechas en JavaScript.',
			isPopular: true,
			category: 'datetime',
			installCommand: 'npm install date-fns',
			docsUrl: 'https://date-fns.org/docs/Getting-Started',
		},
		snippets: [
			{
				title: 'Formatear una fecha',
				code: `import { format } from "date-fns";

const date = new Date(2026, 6, 22);
console.log(format(date, "yyyy-MM-dd"));`,
				output: '2026-07-22',
				language: 'javascript',
			},
			{
				title: 'Calcular una diferencia en días',
				code: `import { differenceInDays } from "date-fns";

const start = new Date(2026, 6, 1);
const end = new Date(2026, 6, 10);
console.log(differenceInDays(end, start));`,
				output: '9',
				language: 'javascript',
			},
		],
	},
	{
		id: 'javascript-uuid',
		language: 'JavaScript',
		languageIcon: '🟨',
		isPopular: true,
		library: {
			name: 'uuid',
			description: 'Genera y valida identificadores únicos universales para aplicaciones.',
			isPopular: true,
			category: 'utilities',
			installCommand: 'npm install uuid',
			docsUrl: 'https://github.com/uuidjs/uuid',
		},
		snippets: [
			{
				title: 'Generar y validar un UUID',
				code: `import { v4 as uuidv4, validate } from "uuid";

const id = uuidv4();
console.log(validate(id));`,
				output: 'true',
				language: 'javascript',
			},
			{
				title: 'Crear un UUID determinista',
				code: `import { v5 as uuidv5 } from "uuid";

const id = uuidv5("https://stackdna.dev", uuidv5.URL);
console.log(id);`,
				output: '79001521-8455-5d50-91c8-0c96e5aed435',
				language: 'javascript',
			},
		],
	},
	{
		id: 'javascript-chalk',
		language: 'JavaScript',
		languageIcon: '🟨',
		isPopular: true,
		library: {
			name: 'chalk',
			description: 'Añade colores y estilos a la salida de texto en terminales.',
			isPopular: true,
			category: 'utilities',
			installCommand: 'npm install chalk',
			docsUrl: 'https://github.com/chalk/chalk',
		},
		snippets: [
			{
				title: 'Mostrar un mensaje de éxito',
				code: `import chalk from "chalk";

const message = chalk.green("Build complete");
console.log(message);`,
				output: 'Build complete',
				language: 'javascript',
			},
			{
				title: 'Combinar estilos para una alerta',
				code: `import chalk from "chalk";

const label = chalk.bgYellow.black("WARNING");
const message = chalk.yellow("Cache is almost full");
console.log(\`\${label} \${message}\`);`,
				output: 'WARNING Cache is almost full',
				language: 'javascript',
			},
		],
	},
	{
		id: 'java-arraylist',
		language: 'Java',
		languageIcon: '☕',
		isPopular: true,
		library: {
			name: 'java.util.ArrayList',
			description: 'Lista redimensionable para almacenar colecciones ordenadas de elementos.',
			isPopular: true,
			category: 'utilities',
			installCommand: 'built-in',
			docsUrl: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/ArrayList.html',
		},
		snippets: [
			{
				title: 'Crear y mostrar una lista',
				code: `import java.util.ArrayList;

var languages = new ArrayList<String>();
languages.add("Python");
languages.add("JavaScript");
System.out.println(languages);`,
				output: '[Python, JavaScript]',
				language: 'java',
			},
			{
				title: 'Eliminar un elemento de la lista',
				code: `import java.util.ArrayList;

var queue = new ArrayList<Integer>();
queue.add(10);
queue.add(20);
queue.remove(Integer.valueOf(10));
System.out.println(queue);`,
				output: '[20]',
				language: 'java',
			},
		],
	},
	{
		id: 'java-hashmap',
		language: 'Java',
		languageIcon: '☕',
		isPopular: true,
		library: {
			name: 'java.util.HashMap',
			description: 'Mapa de pares clave-valor para búsquedas rápidas en memoria.',
			isPopular: true,
			category: 'data',
			installCommand: 'built-in',
			docsUrl: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/HashMap.html',
		},
		snippets: [
			{
				title: 'Consultar un valor por su clave',
				code: `import java.util.HashMap;

var scores = new HashMap<String, Integer>();
scores.put("Ada", 98);
scores.put("Linus", 91);
System.out.println(scores.get("Ada"));`,
				output: '98',
				language: 'java',
			},
			{
				title: 'Usar un valor predeterminado',
				code: `import java.util.HashMap;

var config = new HashMap<String, String>();
config.put("mode", "production");
System.out.println(config.getOrDefault("region", "us-east-1"));`,
				output: 'us-east-1',
				language: 'java',
			},
		],
	},
	{
		id: 'java-localdate',
		language: 'Java',
		languageIcon: '☕',
		isPopular: true,
		library: {
			name: 'java.time.LocalDate',
			description: 'Representa fechas sin hora ni zona temporal de forma segura e inmutable.',
			isPopular: true,
			category: 'datetime',
			installCommand: 'built-in',
			docsUrl: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/time/LocalDate.html',
		},
		snippets: [
			{
				title: 'Calcular una fecha límite',
				code: `import java.time.LocalDate;

var today = LocalDate.of(2026, 7, 22);
var deadline = today.plusDays(14);
System.out.println(deadline);`,
				output: '2026-08-05',
				language: 'java',
			},
			{
				title: 'Contar días entre fechas',
				code: `import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

var start = LocalDate.of(2026, 7, 1);
var end = LocalDate.of(2026, 7, 10);
System.out.println(ChronoUnit.DAYS.between(start, end));`,
				output: '9',
				language: 'java',
			},
		],
	},
	{
		id: 'java-optional',
		language: 'Java',
		languageIcon: '☕',
		isPopular: true,
		library: {
			name: 'java.util.Optional',
			description: 'Modela valores que pueden estar ausentes y evita comprobaciones nulas repetitivas.',
			isPopular: true,
			category: 'utilities',
			installCommand: 'built-in',
			docsUrl: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/Optional.html',
		},
		snippets: [
			{
				title: 'Usar un valor opcional presente',
				code: `import java.util.Optional;

var nickname = Optional.of("Ada");
System.out.println(nickname.orElse("Guest"));`,
				output: 'Ada',
				language: 'java',
			},
			{
				title: 'Proporcionar un valor alternativo',
				code: `import java.util.Optional;

var email = Optional.<String>empty();
var domain = email.map(value -> value.substring(value.indexOf('@') + 1));
System.out.println(domain.orElse("unknown"));`,
				output: 'unknown',
				language: 'java',
			},
		],
	},
	{
		id: 'java-stream',
		language: 'Java',
		languageIcon: '☕',
		isPopular: true,
		library: {
			name: 'java.util.stream',
			description: 'Procesa colecciones declarativamente con operaciones de filtrado, transformación y reducción.',
			isPopular: true,
			category: 'data',
			installCommand: 'built-in',
			docsUrl: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/stream/package-summary.html',
		},
		snippets: [
			{
				title: 'Filtrar nombres por longitud',
				code: `import java.util.List;

var names = List.of("Ada", "Linus", "Grace");
names.stream()
    .filter(name -> name.length() > 3)
    .forEach(System.out::println);`,
				output: 'Linus\nGrace',
				language: 'java',
			},
			{
				title: 'Sumar valores de una colección',
				code: `import java.util.List;

var values = List.of(2, 4, 6);
var total = values.stream().mapToInt(Integer::intValue).sum();
System.out.println(total);`,
				output: '12',
				language: 'java',
			},
		],
	},
];
