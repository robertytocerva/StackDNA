export type LanguageKey = 'python' | 'javascript' | 'java';

export interface LanguageConfig {
	name: string;
	icon: string;
	dna: string;
	runtime: string;
	cmMode: string;
	defaultCode: string;
}

export interface CodeSnippet {
	id: string;
	title: string;
	code: string;
	category: string;
}

export interface LibraryExamples {
	name: string;
	icon: string;
	isBuiltIn: boolean;
	snippets: CodeSnippet[];
}

export type ExamplesMap = Record<LanguageKey, LibraryExamples[]>;

export const LANGUAGES: Record<LanguageKey, LanguageConfig> = {
	python: {
		name: 'Python',
		icon: '🐍',
		dna: 'ATCG·PY',
		runtime: 'Wandbox API',
		cmMode: 'python',
		defaultCode: `import math

resultado = math.sqrt(25)
print("Raíz cuadrada de 25:", resultado)
print("Valor de PI:", math.pi)
print("Factorial de 5:", math.factorial(5))`,
	},
	javascript: {
		name: 'JavaScript',
		icon: '⚡',
		dna: 'JS·ATCG',
		runtime: 'Browser Runtime',
		cmMode: 'javascript',
		defaultCode: `const numeros = [1, 2, 3, 4, 5];

// Map: elevar al cuadrado
const cuadrados = numeros.map(n => n ** 2);
console.log("Cuadrados:", cuadrados);

// Reduce: suma total
const suma = cuadrados.reduce((a, b) => a + b, 0);
console.log("Suma total:", suma);

// Filter: pares
const pares = numeros.filter(n => n % 2 === 0);
console.log("Pares:", pares);`,
	},
	java: {
		name: 'Java',
		icon: '☕',
		dna: 'JVM·ATCG',
		runtime: 'Wandbox API',
		cmMode: 'text/x-java',
		defaultCode: `public class Main {
    public static void main(String[] args) {
        // Math
        System.out.println("Raíz de 25: " + Math.sqrt(25));
        System.out.println("Potencia 2^10: " + Math.pow(2, 10));
        System.out.println("Aleatorio: " + Math.random());

        // String
        String dna = "StackDNA";
        System.out.println("Mayúsculas: " + dna.toUpperCase());
        System.out.println("Longitud: " + dna.length());
    }
}`,
	},
};

export const EXAMPLES: ExamplesMap = {
	python: [
		{
			name: 'math',
			icon: '📐',
			isBuiltIn: true,
			snippets: [
				{
					id: 'py-math-1',
					title: 'Operaciones básicas',
					category: 'math',
					code: `import math

print("Raíz cuadrada de 144:", math.sqrt(144))
print("Potencia 2^8:", math.pow(2, 8))
print("Valor de PI:", math.pi)
print("Valor de E:", math.e)
print("Factorial de 7:", math.factorial(7))`,
				},
				{
					id: 'py-math-2',
					title: 'Trigonometría',
					category: 'math',
					code: `import math

angulo = math.radians(45)
print("Seno de 45°:", round(math.sin(angulo), 4))
print("Coseno de 45°:", round(math.cos(angulo), 4))
print("Tangente de 45°:", round(math.tan(angulo), 4))
print("Hipotenusa (3,4):", math.hypot(3, 4))`,
				},
			],
		},
		{
			name: 'os',
			icon: '💻',
			isBuiltIn: true,
			snippets: [
				{
					id: 'py-os-1',
					title: 'Rutas y archivos',
					category: 'system',
					code: `import os

ruta = os.path.join("src", "data", "config.json")
print("Ruta:", ruta)
print("Nombre:", os.path.basename(ruta))
print("Extensión:", os.path.splitext(ruta)[1])
print("Directorio:", os.path.dirname(ruta))`,
				},
				{
					id: 'py-os-2',
					title: 'Variables de entorno',
					category: 'system',
					code: `import os

os.environ["APP_ENV"] = "production"
os.environ["APP_PORT"] = "3000"

print("Entorno:", os.environ.get("APP_ENV"))
print("Puerto:", os.environ.get("APP_PORT"))
print("Home:", os.environ.get("HOME", "/default"))`,
				},
			],
		},
		{
			name: 'json',
			icon: '📋',
			isBuiltIn: true,
			snippets: [
				{
					id: 'py-json-1',
					title: 'Serialización',
					category: 'data',
					code: `import json

datos = {
    "nombre": "StackDNA",
    "version": 2.0,
    "features": ["scan", "analyze", "report"],
    "active": True
}

json_str = json.dumps(datos, indent=2, ensure_ascii=False)
print(json_str)`,
				},
				{
					id: 'py-json-2',
					title: 'Parsing y acceso',
					category: 'data',
					code: `import json

raw = '{"users": [{"name": "Ana", "age": 28}, {"name": "Luis", "age": 34}]}'
data = json.loads(raw)

for user in data["users"]:
    print(f"{user['name']} tiene {user['age']} años")

print("Total usuarios:", len(data["users"]))`,
				},
			],
		},
		{
			name: 'datetime',
			icon: '📅',
			isBuiltIn: true,
			snippets: [
				{
					id: 'py-dt-1',
					title: 'Fechas y formato',
					category: 'datetime',
					code: `from datetime import datetime, timedelta

ahora = datetime.now()
print("Ahora:", ahora.strftime("%Y-%m-%d %H:%M"))
print("Día:", ahora.strftime("%A"))

futuro = ahora + timedelta(days=30)
print("En 30 días:", futuro.strftime("%d/%m/%Y"))`,
				},
				{
					id: 'py-dt-2',
					title: 'Diferencias de tiempo',
					category: 'datetime',
					code: `from datetime import datetime

inicio = datetime(2024, 1, 1)
fin = datetime(2024, 12, 31)
diferencia = fin - inicio

print(f"Días en 2024: {diferencia.days}")
print(f"Semanas: {diferencia.days // 7}")
print(f"Horas: {diferencia.days * 24}")`,
				},
			],
		},
		{
			name: 'random',
			icon: '🎲',
			isBuiltIn: true,
			snippets: [
				{
					id: 'py-rand-1',
					title: 'Generación aleatoria',
					category: 'utilities',
					code: `import random

print("Entero (1-100):", random.randint(1, 100))
print("Float (0-1):", round(random.random(), 4))
print("Elección:", random.choice(["DNA", "RNA", "Protein"]))

lista = [1, 2, 3, 4, 5]
random.shuffle(lista)
print("Mezclada:", lista)
print("Muestra:", random.sample(range(100), 5))`,
				},
			],
		},
	],
	javascript: [
		{
			name: 'Array',
			icon: '📦',
			isBuiltIn: true,
			snippets: [
				{
					id: 'js-arr-1',
					title: 'Map, Filter, Reduce',
					category: 'utilities',
					code: `const numeros = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const cuadrados = numeros.map(n => n ** 2);
console.log("Cuadrados:", cuadrados);

const pares = numeros.filter(n => n % 2 === 0);
console.log("Pares:", pares);

const suma = numeros.reduce((acc, n) => acc + n, 0);
console.log("Suma total:", suma);

const promedio = suma / numeros.length;
console.log("Promedio:", promedio);`,
				},
				{
					id: 'js-arr-2',
					title: 'Búsqueda y transformación',
					category: 'utilities',
					code: `const usuarios = [
  { nombre: "Ana", edad: 28, rol: "dev" },
  { nombre: "Luis", edad: 34, rol: "lead" },
  { nombre: "Marta", edad: 25, rol: "dev" },
  { nombre: "Carlos", edad: 30, rol: "design" }
];

const devs = usuarios.filter(u => u.rol === "dev");
console.log("Devs:", devs.map(u => u.nombre));

const mayor = usuarios.find(u => u.edad > 30);
console.log("Mayor de 30:", mayor.nombre);

const nombres = usuarios.map(u => u.nombre).sort();
console.log("Ordenados:", nombres);`,
				},
			],
		},
		{
			name: 'Promise',
			icon: '⏳',
			isBuiltIn: true,
			snippets: [
				{
					id: 'js-prom-1',
					title: 'Async/Await básico',
					category: 'utilities',
					code: `function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function proceso() {
  console.log("Inicio del proceso...");
  await delay(100);
  console.log("Paso 1 completado");
  await delay(100);
  console.log("Paso 2 completado");
  return "Proceso finalizado";
}

proceso().then(resultado => console.log(resultado));`,
				},
				{
					id: 'js-prom-2',
					title: 'Promise.all y manejo de errores',
					category: 'utilities',
					code: `const tareas = [
  Promise.resolve("Tarea 1: OK"),
  Promise.resolve("Tarea 2: OK"),
  Promise.resolve("Tarea 3: OK")
];

Promise.all(tareas)
  .then(resultados => {
    resultados.forEach(r => console.log(r));
    console.log("Todas completadas:", resultados.length);
  });

Promise.allSettled([
  Promise.resolve("Éxito"),
  Promise.reject("Error simulado"),
  Promise.resolve("Otro éxito")
]).then(results => {
  results.forEach(r => console.log(r.status, r.value || r.reason));
});`,
				},
			],
		},
		{
			name: 'Object',
			icon: '🔑',
			isBuiltIn: true,
			snippets: [
				{
					id: 'js-obj-1',
					title: 'Destructuring y spread',
					category: 'data',
					code: `const config = {
  host: "localhost",
  port: 3000,
  db: { name: "stackdna", pool: 5 }
};

const { host, port, db: { name: dbName } } = config;
console.log(\`Server: \${host}:\${port}\`);
console.log("DB:", dbName);

const extended = { ...config, ssl: true, port: 443 };
console.log("SSL:", extended.ssl);
console.log("New port:", extended.port);

const keys = Object.keys(config);
console.log("Keys:", keys);`,
				},
			],
		},
		{
			name: 'String',
			icon: '✏️',
			isBuiltIn: true,
			snippets: [
				{
					id: 'js-str-1',
					title: 'Métodos de String',
					category: 'utilities',
					code: `const texto = "  StackDNA - Secuencia tu Stack  ";

console.log("Trim:", texto.trim());
console.log("Upper:", texto.trim().toUpperCase());
console.log("Incluye 'DNA':", texto.includes("DNA"));
console.log("Reemplazar:", texto.trim().replace("Stack", "Code"));
console.log("Split:", texto.trim().split(" - "));

const template = \`Proyecto: \${"StackDNA"}
Version: \${2.0}
Status: \${"active"}\`;
console.log(template);`,
				},
			],
		},
		{
			name: 'Math & Date',
			icon: '🧮',
			isBuiltIn: true,
			snippets: [
				{
					id: 'js-math-1',
					title: 'Operaciones matemáticas',
					category: 'math',
					code: `console.log("PI:", Math.PI);
console.log("Random:", Math.random().toFixed(4));
console.log("Max(5,9,3):", Math.max(5, 9, 3));
console.log("Min(5,9,3):", Math.min(5, 9, 3));
console.log("Round(4.7):", Math.round(4.7));
console.log("Floor(4.7):", Math.floor(4.7));
console.log("Ceil(4.2):", Math.ceil(4.2));
console.log("Pow(2,10):", Math.pow(2, 10));
console.log("Sqrt(144):", Math.sqrt(144));`,
				},
			],
		},
	],
	java: [
		{
			name: 'ArrayList',
			icon: '📋',
			isBuiltIn: true,
			snippets: [
				{
					id: 'java-al-1',
					title: 'Operaciones con listas',
					category: 'data',
					code: `import java.util.ArrayList;
import java.util.Collections;

public class Main {
    public static void main(String[] args) {
        ArrayList<String> stack = new ArrayList<>();
        stack.add("Astro");
        stack.add("TypeScript");
        stack.add("Tailwind");
        stack.add("Node.js");

        System.out.println("Stack: " + stack);
        System.out.println("Size: " + stack.size());
        Collections.sort(stack);
        System.out.println("Sorted: " + stack);
        System.out.println("Contains Astro: " + stack.contains("Astro"));
        stack.remove("Node.js");
        System.out.println("After remove: " + stack);
    }
}`,
				},
			],
		},
		{
			name: 'HashMap',
			icon: '🗂️',
			isBuiltIn: true,
			snippets: [
				{
					id: 'java-hm-1',
					title: 'Mapas clave-valor',
					category: 'data',
					code: `import java.util.HashMap;

public class Main {
    public static void main(String[] args) {
        HashMap<String, Integer> scores = new HashMap<>();
        scores.put("Python", 95);
        scores.put("JavaScript", 90);
        scores.put("Java", 88);
        scores.put("Rust", 82);

        System.out.println("Java score: " + scores.get("Java"));
        System.out.println("Keys: " + scores.keySet());
        System.out.println("Has Rust: " + scores.containsKey("Rust"));

        scores.forEach((lang, score) ->
            System.out.println(lang + ": " + score)
        );
    }
}`,
				},
			],
		},
		{
			name: 'Stream API',
			icon: '🌊',
			isBuiltIn: true,
			snippets: [
				{
					id: 'java-stream-1',
					title: 'Filtrar y transformar',
					category: 'utilities',
					code: `import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

public class Main {
    public static void main(String[] args) {
        List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

        List<Integer> evens = numbers.stream()
            .filter(n -> n % 2 == 0)
            .collect(Collectors.toList());
        System.out.println("Pares: " + evens);

        int sum = numbers.stream()
            .reduce(0, Integer::sum);
        System.out.println("Suma: " + sum);

        List<Integer> squared = numbers.stream()
            .map(n -> n * n)
            .collect(Collectors.toList());
        System.out.println("Cuadrados: " + squared);
    }
}`,
				},
			],
		},
		{
			name: 'String & Math',
			icon: '🔤',
			isBuiltIn: true,
			snippets: [
				{
					id: 'java-str-1',
					title: 'Manipulación de strings',
					category: 'utilities',
					code: `public class Main {
    public static void main(String[] args) {
        String dna = "StackDNA Framework";

        System.out.println("Upper: " + dna.toUpperCase());
        System.out.println("Lower: " + dna.toLowerCase());
        System.out.println("Length: " + dna.length());
        System.out.println("Contains DNA: " + dna.contains("DNA"));
        System.out.println("Replace: " + dna.replace("Stack", "Code"));
        System.out.println("Substring: " + dna.substring(0, 8));
        System.out.println("Split: " + java.util.Arrays.toString(dna.split(" ")));

        // Math
        System.out.println("Sqrt(256): " + Math.sqrt(256));
        System.out.println("Pow(2,8): " + (int)Math.pow(2, 8));
    }
}`,
				},
			],
		},
	],
};
