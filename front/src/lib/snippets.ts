import type { CatalogEntry } from './types';

/**
 * Ejemplos de código para las tarjetas del catálogo.
 *
 * El backend no expone snippets (`key_features` y `use_cases` llegan vacíos), así que
 * los ejemplos se resuelven en el frontend en dos niveles:
 *   1. CURATED_SNIPPETS: ejemplos escritos a mano para las librerías más usadas.
 *   2. buildFallbackSnippets(): instalación + import/uso básico derivados del ecosistema.
 */

export type SnippetLanguage = 'javascript' | 'python' | 'java' | 'bash' | 'xml';

export interface Snippet {
	title: string;
	language: SnippetLanguage;
	code: string;
	output?: string;
	/** true cuando el snippet es plantilla genérica y no un ejemplo curado. */
	generated?: boolean;
}

const CURATED_SNIPPETS: Record<string, Snippet[]> = {
	// ── Python ────────────────────────────────────────────────────────────────
	requests: [
		{
			title: 'GET con respuesta JSON',
			language: 'python',
			code: `import requests

response = requests.get("https://api.github.com/repos/psf/requests", timeout=10)
response.raise_for_status()
data = response.json()
print(data["stargazers_count"])`,
			output: '52341',
		},
	],
	httpx: [
		{
			title: 'Petición asíncrona',
			language: 'python',
			code: `import asyncio
import httpx

async def main():
    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.get("https://httpbin.org/json")
        print(response.status_code, response.json()["slideshow"]["title"])

asyncio.run(main())`,
			output: '200 Sample Slide Show',
		},
	],
	numpy: [
		{
			title: 'Operaciones vectorizadas',
			language: 'python',
			code: `import numpy as np

matrix = np.array([[1, 2], [3, 4]])
print(matrix.mean())
print(matrix @ matrix)`,
			output: '2.5\n[[ 7 10]\n [15 22]]',
		},
	],
	pandas: [
		{
			title: 'Agrupar y agregar',
			language: 'python',
			code: `import pandas as pd

df = pd.DataFrame({
    "lenguaje": ["python", "python", "java"],
    "descargas": [120, 80, 45],
})
print(df.groupby("lenguaje")["descargas"].sum())`,
			output: 'lenguaje\njava       45\npython    200\nName: descargas, dtype: int64',
		},
	],
	flask: [
		{
			title: 'API mínima',
			language: 'python',
			code: `from flask import Flask, jsonify

app = Flask(__name__)

@app.get("/health")
def health():
    return jsonify(status="ok")

if __name__ == "__main__":
    app.run(port=5000)`,
			output: '$ curl localhost:5000/health\n{"status":"ok"}',
		},
	],
	fastapi: [
		{
			title: 'Endpoint con validación',
			language: 'python',
			code: `from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class Library(BaseModel):
    name: str
    language: str

@app.post("/libraries")
def create(library: Library):
    return {"created": library.name}`,
			output: '{"created":"numpy"}',
		},
	],
	django: [
		{
			title: 'Modelo y consulta ORM',
			language: 'python',
			code: `from django.db import models

class Library(models.Model):
    name = models.CharField(max_length=120)
    language = models.CharField(max_length=32)

# En una vista o shell:
Library.objects.filter(language="python").order_by("name").values_list("name", flat=True)`,
			output: "<QuerySet ['numpy', 'pandas', 'requests']>",
		},
	],
	sqlalchemy: [
		{
			title: 'Sesión y select (2.0)',
			language: 'python',
			code: `from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session

engine = create_engine("postgresql+psycopg2://user:pass@localhost/stackdna")

with Session(engine) as session:
    rows = session.execute(select(Library).where(Library.language == "python")).scalars()
    print([row.name for row in rows])`,
			output: "['numpy', 'pandas']",
		},
	],
	pytest: [
		{
			title: 'Test con fixture',
			language: 'python',
			code: `import pytest

@pytest.fixture
def libraries():
    return ["numpy", "pandas"]

def test_contains_numpy(libraries):
    assert "numpy" in libraries`,
			output: '$ pytest -q\n1 passed in 0.01s',
		},
	],
	unittest: [
		{
			title: 'TestCase básico',
			language: 'python',
			code: `import unittest

class TestCatalog(unittest.TestCase):
    def test_upper(self):
        self.assertEqual("numpy".upper(), "NUMPY")

if __name__ == "__main__":
    unittest.main()`,
			output: 'Ran 1 test in 0.000s\n\nOK',
		},
	],
	pydantic: [
		{
			title: 'Validar datos de entrada',
			language: 'python',
			code: `from pydantic import BaseModel, ValidationError

class Library(BaseModel):
    name: str
    stars: int

try:
    Library(name="numpy", stars="muchas")
except ValidationError as error:
    print(error.errors()[0]["msg"])`,
			output: 'Input should be a valid integer, unable to parse string as an integer',
		},
	],
	click: [
		{
			title: 'Comando con opciones',
			language: 'python',
			code: `import click

@click.command()
@click.option("--lang", default="python", help="Lenguaje a filtrar")
def search(lang):
    click.echo(f"Buscando librerías de {lang}")

if __name__ == "__main__":
    search()`,
			output: '$ python cli.py --lang java\nBuscando librerías de java',
		},
	],
	typer: [
		{
			title: 'CLI con tipos',
			language: 'python',
			code: `import typer

app = typer.Typer()

@app.command()
def search(lang: str = "python", limit: int = 10):
    typer.echo(f"{lang} -> {limit} resultados")

if __name__ == "__main__":
    app()`,
			output: '$ python cli.py --lang java --limit 5\njava -> 5 resultados',
		},
	],
	beautifulsoup4: [
		{
			title: 'Extraer enlaces de un HTML',
			language: 'python',
			code: `from bs4 import BeautifulSoup

html = "<ul><li><a href='/numpy'>numpy</a></li><li><a href='/pandas'>pandas</a></li></ul>"
soup = BeautifulSoup(html, "html.parser")
print([a["href"] for a in soup.select("a")])`,
			output: "['/numpy', '/pandas']",
		},
	],
	matplotlib: [
		{
			title: 'Gráfico de líneas',
			language: 'python',
			code: `import matplotlib.pyplot as plt

plt.plot([1, 2, 3, 4], [10, 24, 18, 30], marker="o")
plt.title("Descargas por semana")
plt.savefig("descargas.png", dpi=150)`,
			output: 'descargas.png generado',
		},
	],
	pillow: [
		{
			title: 'Redimensionar una imagen',
			language: 'python',
			code: `from PIL import Image

with Image.open("logo.png") as image:
    image.thumbnail((256, 256))
    image.save("logo-small.png")
    print(image.size)`,
			output: '(256, 180)',
		},
	],
	celery: [
		{
			title: 'Tarea en background',
			language: 'python',
			code: `from celery import Celery

app = Celery("stackdna", broker="redis://localhost:6379/0")

@app.task
def sync_registry(source: str):
    return f"sync {source} listo"

sync_registry.delay("npm")`,
			output: '<AsyncResult: 7b2f...>',
		},
	],
	redis: [
		{
			title: 'Cachear un valor',
			language: 'python',
			code: `import redis

client = redis.Redis(host="localhost", port=6379, decode_responses=True)
client.setex("libs:python:count", 60, 98)
print(client.get("libs:python:count"))`,
			output: '98',
		},
	],
	'python-dotenv': [
		{
			title: 'Cargar variables de entorno',
			language: 'python',
			code: `import os
from dotenv import load_dotenv

load_dotenv()  # lee el archivo .env
print(os.getenv("DATABASE_URL"))`,
			output: 'postgresql://localhost/stackdna',
		},
	],
	loguru: [
		{
			title: 'Logging con contexto',
			language: 'python',
			code: `from loguru import logger

logger.add("app.log", rotation="1 MB", level="INFO")
logger.info("Sync iniciado para {source}", source="npm")`,
			output: '2026-07-24 18:00:00 | INFO | Sync iniciado para npm',
		},
	],
	rich: [
		{
			title: 'Tabla en la terminal',
			language: 'python',
			code: `from rich.console import Console
from rich.table import Table

table = Table(title="Catálogo")
table.add_column("Librería")
table.add_column("Lenguaje")
table.add_row("numpy", "python")
Console().print(table)`,
			output: '        Catálogo\n┏━━━━━━━━━━┳━━━━━━━━━━┓\n┃ Librería ┃ Lenguaje ┃\n┡━━━━━━━━━━╇━━━━━━━━━━┩\n│ numpy    │ python   │\n└──────────┴──────────┘',
		},
	],
	argparse: [
		{
			title: 'Argumentos de línea de comandos',
			language: 'python',
			code: `import argparse

parser = argparse.ArgumentParser(description="Buscar librerías")
parser.add_argument("query")
parser.add_argument("--lang", default="python")
args = parser.parse_args()
print(args.query, args.lang)`,
			output: '$ python cli.py http --lang java\nhttp java',
		},
	],
	jinja2: [
		{
			title: 'Renderizar una plantilla',
			language: 'python',
			code: `from jinja2 import Template

template = Template("Hola {{ name }}, tienes {{ count }} librerías")
print(template.render(name="Dev", count=349))`,
			output: 'Hola Dev, tienes 349 librerías',
		},
	],
	'scikit-learn': [
		{
			title: 'Entrenar y predecir',
			language: 'python',
			code: `from sklearn.linear_model import LinearRegression

model = LinearRegression().fit([[1], [2], [3]], [2, 4, 6])
print(model.predict([[4]]))`,
			output: '[8.]',
		},
	],
	selenium: [
		{
			title: 'Abrir una página y leer el título',
			language: 'python',
			code: `from selenium import webdriver

driver = webdriver.Chrome()
driver.get("https://docs.astro.build")
print(driver.title)
driver.quit()`,
			output: 'Docs | Astro',
		},
	],
	sqlmodel: [
		{
			title: 'Modelo y consulta',
			language: 'python',
			code: `from sqlmodel import Field, Session, SQLModel, create_engine, select

class Library(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str

engine = create_engine("sqlite:///catalog.db")
SQLModel.metadata.create_all(engine)

with Session(engine) as session:
    session.add(Library(name="numpy"))
    session.commit()
    print(session.exec(select(Library)).all())`,
			output: '[Library(id=1, name=\'numpy\')]',
		},
	],

	// ── JavaScript ────────────────────────────────────────────────────────────
	axios: [
		{
			title: 'GET con async/await',
			language: 'javascript',
			code: `import axios from 'axios';

const { data } = await axios.get('http://localhost:3000/api/technologies', {
  params: { lang: 'python', limit: 5 },
});

console.log(data.pagination.total);`,
			output: '98',
		},
	],
	express: [
		{
			title: 'Servidor con una ruta JSON',
			language: 'javascript',
			code: `import express from 'express';

const app = express();
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.listen(3000, () => console.log('http://localhost:3000'));`,
			output: '$ curl localhost:3000/health\n{"status":"ok"}',
		},
	],
	fastify: [
		{
			title: 'Servidor con schema',
			language: 'javascript',
			code: `import Fastify from 'fastify';

const app = Fastify({ logger: true });

app.get('/health', async () => ({ status: 'ok' }));

await app.listen({ port: 3000 });`,
			output: '{"status":"ok"}',
		},
	],
	lodash: [
		{
			title: 'Agrupar y ordenar colecciones',
			language: 'javascript',
			code: `import _ from 'lodash';

const libs = [
  { name: 'numpy', lang: 'python' },
  { name: 'axios', lang: 'javascript' },
  { name: 'pandas', lang: 'python' },
];

console.log(_.mapValues(_.groupBy(libs, 'lang'), (group) => group.length));`,
			output: '{ python: 2, javascript: 1 }',
		},
	],
	dayjs: [
		{
			title: 'Formatear y sumar fechas',
			language: 'javascript',
			code: `import dayjs from 'dayjs';

const now = dayjs('2026-07-24');
console.log(now.add(7, 'day').format('DD/MM/YYYY'));`,
			output: '31/07/2026',
		},
	],
	luxon: [
		{
			title: 'Zonas horarias',
			language: 'javascript',
			code: `import { DateTime } from 'luxon';

const utc = DateTime.fromISO('2026-07-24T18:00:00Z');
console.log(utc.setZone('America/Mexico_City').toFormat('yyyy-LL-dd HH:mm'));`,
			output: '2026-07-24 12:00',
		},
	],
	zod: [
		{
			title: 'Validar un objeto',
			language: 'javascript',
			code: `import { z } from 'zod';

const LibrarySchema = z.object({
  name: z.string().min(1),
  stars: z.number().int().nonnegative(),
});

const result = LibrarySchema.safeParse({ name: 'zod', stars: -1 });
console.log(result.success, result.error?.issues[0].message);`,
			output: 'false Too small: expected number to be >=0',
		},
	],
	joi: [
		{
			title: 'Schema de validación',
			language: 'javascript',
			code: `import Joi from 'joi';

const schema = Joi.object({
  name: Joi.string().required(),
  limit: Joi.number().min(1).max(100).default(20),
});

const { value, error } = schema.validate({ name: 'joi' });
console.log(error ?? value);`,
			output: "{ name: 'joi', limit: 20 }",
		},
	],
	dotenv: [
		{
			title: 'Cargar el archivo .env',
			language: 'javascript',
			code: `import 'dotenv/config';

console.log(process.env.DATABASE_URL);`,
			output: 'postgresql://localhost/stackdna',
		},
	],
	chalk: [
		{
			title: 'Colores en la terminal',
			language: 'javascript',
			code: `import chalk from 'chalk';

console.log(chalk.green.bold('✔ sync npm'), chalk.dim('52 items'));`,
			output: '✔ sync npm 52 items',
		},
	],
	commander: [
		{
			title: 'CLI con opciones',
			language: 'javascript',
			code: `import { Command } from 'commander';

const program = new Command();
program
  .option('--lang <lang>', 'lenguaje', 'python')
  .action((options) => console.log('Buscando', options.lang))
  .parse();`,
			output: '$ node cli.js --lang java\nBuscando java',
		},
	],
	yargs: [
		{
			title: 'Parsear argumentos',
			language: 'javascript',
			code: `import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const argv = yargs(hideBin(process.argv)).option('limit', { type: 'number', default: 20 }).parseSync();
console.log(argv.limit);`,
			output: '$ node cli.js --limit 5\n5',
		},
	],
	cheerio: [
		{
			title: 'Scraping de HTML',
			language: 'javascript',
			code: `import * as cheerio from 'cheerio';

const $ = cheerio.load('<ul><li class="lib">axios</li><li class="lib">zod</li></ul>');
console.log($('.lib').map((i, el) => $(el).text()).get());`,
			output: "[ 'axios', 'zod' ]",
		},
	],
	jest: [
		{
			title: 'Test unitario',
			language: 'javascript',
			code: `import { sum } from './sum.js';

test('suma dos números', () => {
  expect(sum(2, 3)).toBe(5);
});`,
			output: '$ npx jest\nTests: 1 passed, 1 total',
		},
	],
	vitest: [
		{
			title: 'Test con Vitest',
			language: 'javascript',
			code: `import { describe, expect, it } from 'vitest';
import { toCatalogEntry } from '../src/lib/api';

describe('catalog', () => {
  it('mapea el nombre', () => {
    expect(toCatalogEntry({ nombre: 'axios' }).name).toBe('axios');
  });
});`,
			output: '✓ catalog > mapea el nombre',
		},
	],
	mocha: [
		{
			title: 'Suite con Mocha + assert',
			language: 'javascript',
			code: `import assert from 'node:assert/strict';

describe('catalog', () => {
  it('normaliza slugs', () => {
    assert.equal('Axios'.toLowerCase(), 'axios');
  });
});`,
			output: '$ npx mocha\n1 passing',
		},
	],
	mongoose: [
		{
			title: 'Modelo y consulta',
			language: 'javascript',
			code: `import mongoose from 'mongoose';

await mongoose.connect('mongodb://localhost:27017/stackdna');

const Library = mongoose.model('Library', new mongoose.Schema({ name: String, lang: String }));
const pythonLibs = await Library.find({ lang: 'python' }).select('name').lean();
console.log(pythonLibs);`,
			output: "[ { _id: ..., name: 'numpy' } ]",
		},
	],
	prisma: [
		{
			title: 'Consulta con el cliente',
			language: 'javascript',
			code: `import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const libs = await prisma.technology.findMany({
  where: { lenguaje: 'python' },
  take: 5,
  orderBy: { nombre: 'asc' },
});

console.log(libs.length);`,
			output: '5',
		},
	],
	knex: [
		{
			title: 'Query builder',
			language: 'javascript',
			code: `import knex from 'knex';

const db = knex({ client: 'pg', connection: process.env.DATABASE_URL });

const rows = await db('technologies').where({ lenguaje: 'java' }).count('* as total');
console.log(rows[0].total);`,
			output: '38',
		},
	],
	pg: [
		{
			title: 'Consulta parametrizada',
			language: 'javascript',
			code: `import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const { rows } = await pool.query('select nombre from technologies where lenguaje = $1 limit 3', ['python']);
console.log(rows.map((row) => row.nombre));`,
			output: "[ 'aiohttp', 'alembic', 'apscheduler' ]",
		},
	],
	jsonwebtoken: [
		{
			title: 'Firmar y verificar un token',
			language: 'javascript',
			code: `import jwt from 'jsonwebtoken';

const token = jwt.sign({ sub: '42' }, process.env.JWT_SECRET, { expiresIn: '1h' });
const payload = jwt.verify(token, process.env.JWT_SECRET);
console.log(payload.sub);`,
			output: '42',
		},
	],
	uuid: [
		{
			title: 'Generar identificadores',
			language: 'javascript',
			code: `import { v4 as uuidv4 } from 'uuid';

console.log(uuidv4());`,
			output: '9f1c2e64-3b0a-4a1e-9a1f-2c7c8a0d5b31',
		},
	],
	nanoid: [
		{
			title: 'IDs cortos y seguros',
			language: 'javascript',
			code: `import { nanoid } from 'nanoid';

console.log(nanoid(10));`,
			output: 'V1StGXR8_Z',
		},
	],
	winston: [
		{
			title: 'Logger con transportes',
			language: 'javascript',
			code: `import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()],
});

logger.info('sync completado', { source: 'npm', items: 52 });`,
			output: '{"level":"info","message":"sync completado","source":"npm","items":52}',
		},
	],
	pino: [
		{
			title: 'Logging estructurado',
			language: 'javascript',
			code: `import pino from 'pino';

const logger = pino({ level: 'info' });
logger.info({ source: 'pypi', items: 45 }, 'sync completado');`,
			output: '{"level":30,"source":"pypi","items":45,"msg":"sync completado"}',
		},
	],
	'node-fetch': [
		{
			title: 'Petición HTTP',
			language: 'javascript',
			code: `import fetch from 'node-fetch';

const response = await fetch('http://localhost:3000/api/categories');
const categories = await response.json();
console.log(categories[0]);`,
			output: "{ categoria: 'utility', count: '94' }",
		},
	],
	got: [
		{
			title: 'GET con reintentos',
			language: 'javascript',
			code: `import got from 'got';

const data = await got('http://localhost:3000/api/ecosystems', { retry: { limit: 2 } }).json();
console.log(data.map((eco) => eco.ecosistema));`,
			output: "[ 'npm', 'pypi', 'maven' ]",
		},
	],
	ws: [
		{
			title: 'Servidor WebSocket',
			language: 'javascript',
			code: `import { WebSocketServer } from 'ws';

const server = new WebSocketServer({ port: 8080 });

server.on('connection', (socket) => {
  socket.on('message', (data) => socket.send('eco: ' + data));
});`,
			output: 'eco: hola',
		},
	],
	'socket.io': [
		{
			title: 'Eventos en tiempo real',
			language: 'javascript',
			code: `import { Server } from 'socket.io';

const io = new Server(3001, { cors: { origin: '*' } });

io.on('connection', (socket) => {
  socket.emit('welcome', { catalog: 349 });
  socket.on('search', (query) => console.log('buscando', query));
});`,
			output: "buscando { lang: 'python' }",
		},
	],
	nodemailer: [
		{
			title: 'Enviar un correo',
			language: 'javascript',
			code: `import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.example.com',
  port: 587,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

const info = await transporter.sendMail({
  from: 'bot@stackdna.dev',
  to: 'dev@example.com',
  subject: 'Sync listo',
  text: '349 librerías indexadas',
});

console.log(info.messageId);`,
			output: '<a1b2c3@stackdna.dev>',
		},
	],
	sharp: [
		{
			title: 'Redimensionar y convertir',
			language: 'javascript',
			code: `import sharp from 'sharp';

await sharp('logo.png').resize(256).webp({ quality: 80 }).toFile('logo.webp');`,
			output: 'logo.webp generado',
		},
	],
	puppeteer: [
		{
			title: 'Screenshot de una página',
			language: 'javascript',
			code: `import puppeteer from 'puppeteer';

const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.goto('http://localhost:4321/librerias');
await page.screenshot({ path: 'librerias.png', fullPage: true });
await browser.close();`,
			output: 'librerias.png generado',
		},
	],
	playwright: [
		{
			title: 'Test end to end',
			language: 'javascript',
			code: `import { expect, test } from '@playwright/test';

test('filtra por lenguaje', async ({ page }) => {
  await page.goto('http://localhost:4321/librerias');
  await page.getByRole('button', { name: 'Python' }).click();
  await expect(page.locator('[data-language-section="Python"]')).toBeVisible();
});`,
			output: '1 passed',
		},
	],
	cors: [
		{
			title: 'Habilitar CORS en Express',
			language: 'javascript',
			code: `import cors from 'cors';
import express from 'express';

const app = express();
app.use(cors({ origin: ['http://localhost:4321'] }));`,
			output: 'Access-Control-Allow-Origin: http://localhost:4321',
		},
	],
	helmet: [
		{
			title: 'Cabeceras de seguridad',
			language: 'javascript',
			code: `import express from 'express';
import helmet from 'helmet';

const app = express();
app.use(helmet());`,
			output: 'X-Content-Type-Options: nosniff\nStrict-Transport-Security: max-age=15552000',
		},
	],
	react: [
		{
			title: 'Componente con estado',
			language: 'javascript',
			code: `import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button type="button" onClick={() => setCount(count + 1)}>
      Librerías vistas: {count}
    </button>
  );
}`,
			output: 'Librerías vistas: 3',
		},
	],
	vue: [
		{
			title: 'Componente con Composition API',
			language: 'javascript',
			code: `import { createApp, ref } from 'vue';

createApp({
  setup() {
    const total = ref(349);
    return { total };
  },
  template: '<p>{{ total }} librerías</p>',
}).mount('#app');`,
			output: '349 librerías',
		},
	],
	ioredis: [
		{
			title: 'Cache con TTL',
			language: 'javascript',
			code: `import Redis from 'ioredis';

const redis = new Redis();
await redis.set('libs:total', 349, 'EX', 60);
console.log(await redis.get('libs:total'));`,
			output: '349',
		},
	],

	// ── Java ──────────────────────────────────────────────────────────────────
	gson: [
		{
			title: 'Serializar y deserializar',
			language: 'java',
			code: `import com.google.gson.Gson;

record Library(String name, String language) {}

Gson gson = new Gson();
String json = gson.toJson(new Library("gson", "java"));
Library parsed = gson.fromJson(json, Library.class);

System.out.println(json);
System.out.println(parsed.name());`,
			output: '{"name":"gson","language":"java"}\ngson',
		},
	],
	'jackson-databind': [
		{
			title: 'Mapear JSON a objetos',
			language: 'java',
			code: `import com.fasterxml.jackson.databind.ObjectMapper;

record Library(String nombre, String lenguaje) {}

ObjectMapper mapper = new ObjectMapper();
Library library = mapper.readValue("{\\"nombre\\":\\"guava\\",\\"lenguaje\\":\\"java\\"}", Library.class);
System.out.println(library.nombre());`,
			output: 'guava',
		},
	],
	okhttp: [
		{
			title: 'Petición GET',
			language: 'java',
			code: `import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;

OkHttpClient client = new OkHttpClient();
Request request = new Request.Builder()
    .url("http://localhost:3000/api/ecosystems")
    .build();

try (Response response = client.newCall(request).execute()) {
    System.out.println(response.code());
    System.out.println(response.body().string());
}`,
			output: '200\n[{"ecosistema":"npm","count":"213"}, ...]',
		},
	],
	guava: [
		{
			title: 'Colecciones inmutables',
			language: 'java',
			code: `import com.google.common.collect.ImmutableList;
import com.google.common.base.Joiner;

ImmutableList<String> langs = ImmutableList.of("java", "python", "javascript");
System.out.println(Joiner.on(" | ").join(langs));`,
			output: 'java | python | javascript',
		},
	],
	'junit-jupiter': [
		{
			title: 'Test con JUnit 5',
			language: 'java',
			code: `import static org.junit.jupiter.api.Assertions.assertEquals;
import org.junit.jupiter.api.Test;

class CatalogTest {
    @Test
    void normalizaElNombre() {
        assertEquals("okhttp", "OkHttp".toLowerCase());
    }
}`,
			output: 'Tests run: 1, Failures: 0',
		},
	],
	'slf4j-api': [
		{
			title: 'Logging con parámetros',
			language: 'java',
			code: `import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class SyncJob {
    private static final Logger log = LoggerFactory.getLogger(SyncJob.class);

    public void run(String source, int items) {
        log.info("sync {} completado con {} items", source, items);
    }
}`,
			output: 'INFO SyncJob - sync maven completado con 38 items',
		},
	],
	'commons-lang3': [
		{
			title: 'Utilidades de String',
			language: 'java',
			code: `import org.apache.commons.lang3.StringUtils;

System.out.println(StringUtils.isBlank("   "));
System.out.println(StringUtils.abbreviate("spring-boot-starter-web", 12));`,
			output: 'true\nspring-boo...',
		},
	],
	'java-jwt': [
		{
			title: 'Crear y verificar un JWT',
			language: 'java',
			code: `import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;

Algorithm algorithm = Algorithm.HMAC256(System.getenv("JWT_SECRET"));
String token = JWT.create().withSubject("42").sign(algorithm);
String subject = JWT.require(algorithm).build().verify(token).getSubject();

System.out.println(subject);`,
			output: '42',
		},
	],
	'spring-boot-starter-web': [
		{
			title: 'Controlador REST',
			language: 'java',
			code: `import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
@RestController
public class Api {
    @GetMapping("/health")
    public String health() {
        return "ok";
    }

    public static void main(String[] args) {
        SpringApplication.run(Api.class, args);
    }
}`,
			output: '$ curl localhost:8080/health\nok',
		},
	],
	lombok: [
		{
			title: 'Reducir boilerplate',
			language: 'java',
			code: `import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class Library {
    String name;
    String language;
}

Library lib = Library.builder().name("lombok").language("java").build();
System.out.println(lib);`,
			output: 'Library(name=lombok, language=java)',
		},
	],
	HikariCP: [
		{
			title: 'Pool de conexiones',
			language: 'java',
			code: `import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;

HikariConfig config = new HikariConfig();
config.setJdbcUrl("jdbc:postgresql://localhost:5432/stackdna");
config.setMaximumPoolSize(10);

try (HikariDataSource ds = new HikariDataSource(config);
     var connection = ds.getConnection()) {
    System.out.println(connection.isValid(2));
}`,
			output: 'true',
		},
	],
	'logback-classic': [
		{
			title: 'Configuración mínima',
			language: 'xml',
			code: `<configuration>
  <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
    <encoder>
      <pattern>%d{HH:mm:ss} %-5level %logger{20} - %msg%n</pattern>
    </encoder>
  </appender>
  <root level="info">
    <appender-ref ref="STDOUT" />
  </root>
</configuration>`,
			output: '18:00:00 INFO  c.s.SyncJob - sync npm completado',
		},
	],
	rxjava: [
		{
			title: 'Stream reactivo',
			language: 'java',
			code: `import io.reactivex.rxjava3.core.Observable;

Observable.just("npm", "pypi", "maven")
    .map(String::toUpperCase)
    .subscribe(System.out::println);`,
			output: 'NPM\nPYPI\nMAVEN',
		},
	],
};

/** Identificador JS válido a partir de un nombre de paquete npm. */
function toIdentifier(slug: string): string {
	const base = slug.replace(/^@[^/]+\//, '').replace(/\.js$/, '');
	const camel = base
		.split(/[^a-zA-Z0-9]+/)
		.filter(Boolean)
		.map((part, index) => (index === 0 ? part : part[0].toUpperCase() + part.slice(1)))
		.join('');
	const identifier = /^[a-zA-Z_$]/.test(camel) ? camel : `lib${camel}`;
	return identifier || 'lib';
}

/** Nombre de módulo Python a partir del nombre del paquete PyPI. */
function toPythonModule(slug: string): string {
	const known: Record<string, string> = {
		beautifulsoup4: 'bs4',
		'python-dateutil': 'dateutil',
		'python-dotenv': 'dotenv',
		'python-jose': 'jose',
		'opencv-python': 'cv2',
		pillow: 'PIL',
		'scikit-learn': 'sklearn',
		pyyaml: 'yaml',
		psycopg2: 'psycopg2',
		'charset-normalizer': 'charset_normalizer',
	};
	return known[slug.toLowerCase()] ?? slug.replace(/^python-/, '').replace(/[-.]/g, '_');
}

function buildFallbackSnippets(entry: CatalogEntry): Snippet[] {
	const install = entry.installCommand && entry.installCommand !== 'built-in' ? entry.installCommand : '';

	if (entry.ecosystem === 'pypi' || entry.language === 'python') {
		const module = toPythonModule(entry.slug);
		return [
			{
				title: `Instalar y usar ${entry.name}`,
				language: 'python',
				code: `# ${install || 'módulo de la librería estándar'}
import ${module}

# Explora la API disponible en tiempo de ejecución
print([name for name in dir(${module}) if not name.startswith("_")][:8])
help(${module})`,
				output: `Ayuda del módulo ${module}`,
				generated: true,
			},
		];
	}

	if (entry.ecosystem === 'maven' || entry.language === 'java') {
		return [
			{
				title: `Dependencia Maven de ${entry.name}`,
				language: 'xml',
				code: install || `<dependency>\n  <groupId>${entry.slug}</groupId>\n  <artifactId>${entry.slug}</artifactId>\n</dependency>`,
				output: 'mvn dependency:resolve',
				generated: true,
			},
			{
				title: `Gradle (Kotlin DSL)`,
				language: 'java',
				code: `// build.gradle.kts
dependencies {
    implementation("${entry.slug}:${entry.version ?? 'latest.release'}")
}`,
				generated: true,
			},
		];
	}

	const identifier = toIdentifier(entry.slug);
	return [
		{
			title: `Instalar e importar ${entry.name}`,
			language: 'javascript',
			code: `// ${install || `npm install ${entry.slug}`}

// ESM
import ${identifier} from '${entry.slug}';

// CommonJS
const ${identifier}Cjs = require('${entry.slug}');

console.log(Object.keys(${identifier}).slice(0, 8));`,
			output: `Exports principales de ${entry.slug}`,
			generated: true,
		},
	];
}

/** Devuelve los ejemplos de una librería: curados si existen, generados si no. */
export function getSnippets(entry: CatalogEntry): Snippet[] {
	const curated = CURATED_SNIPPETS[entry.slug] ?? CURATED_SNIPPETS[entry.slug.toLowerCase()];
	return curated ?? buildFallbackSnippets(entry);
}

/** true cuando la librería tiene ejemplos escritos a mano. */
export function hasCuratedSnippets(slug: string): boolean {
	return Boolean(CURATED_SNIPPETS[slug] ?? CURATED_SNIPPETS[slug.toLowerCase()]);
}

export const CURATED_SNIPPET_COUNT = Object.keys(CURATED_SNIPPETS).length;
