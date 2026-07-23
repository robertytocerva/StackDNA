const axios = require('axios');
const db = require('../config/database');
const catalogService = require('../modules/catalog/catalog.service');
const { getLogoUrl } = require('./logoService');

const NPM_REGISTRY = 'https://registry.npmjs.org';
const NPM_SEARCH = 'https://registry.npmjs.org/-/v1/search';

const POPULAR_PACKAGES = [
  'express', 'fastify', 'koa', 'hapi',
  'react', 'vue', 'angular', 'svelte', 'next', 'nuxt',
  'axios', 'node-fetch', 'got', 'superagent',
  'lodash', 'underscore', 'ramda', 'date-fns', 'moment',
  'jest', 'mocha', 'chai', 'vitest', 'cypress', 'playwright',
  'typescript', 'ts-node', 'esbuild',
  'sequelize', 'knex', 'prisma', 'typeorm', 'mongoose',
  'dotenv', 'cors', 'helmet', 'morgan', 'body-parser',
  'webpack', 'vite', 'rollup', 'parcel',
  'redis', 'bull', 'bullmq',
  'socket.io', 'ws', 'socket',
  'nodemailer', 'sendgrid',
  'multer', 'formidable',
  'jsonwebtoken', 'passport', 'bcrypt',
  'winston', 'pino', 'bunyan',
  'joi', 'yup', 'zod', 'ajv',
  'commander', 'yargs', 'inquirer',
  'chalk', 'ora', 'cli-table',
  'sharp', 'jimp',
  'cheerio', 'puppeteer', 'playwright',
  'pg', 'mysql2', 'better-sqlite3',
  'ioredis', 'bull',
  'agenda', 'node-schedule',
  'glob', 'fs-extra', 'chokidar',
  'uuid', 'nanoid',
  'date-fns', 'dayjs', 'luxon',
  'async', 'p-limit', 'p-queue',
  'lodash', 'remeda',
  'debug', 'ms',
  'cookie', 'cookies',
  'compression', 'helmet',
  'serve-static', 'express-static',
  'multer', 'busboy',
  'nodemon', 'pm2', 'concurrently',
  'eslint', 'prettier', 'stylelint',
  'husky', 'lint-staged',
  'storybook', '@storybook/react',
  'tailwindcss', 'postcss', 'autoprefixer',
  'sass', 'less', 'stylus',
  'three', 'd3', 'chart.js',
  'tensorflow', '@tensorflow/tfjs',
  'openai', '@anthropic-ai/sdk',
];

const SEARCH_TERMS = [
  'web+framework', 'testing', 'http+client', 'database', 'orm',
  'authentication', 'validation', 'logging', 'cli', 'scheduler',
  'email', 'file+upload', 'websocket', 'graphql', 'cache',
  'image+processing', 'pdf', 'csv', 'excel', 'pdf-generator',
  'payment', 'stripe', 'twilio', 'sendgrid',
  'react+components', 'vue+components', 'angular+components',
  'state+management', 'form+validation', 'date+format',
  'env+config', 'logger', 'monitor', 'performance',
];

async function syncNpm() {
  const log = { fuente: 'npm', status: 'success', items_synced: 0, error_message: null };

  try {
    for (const pkg of POPULAR_PACKAGES) {
      try {
        const { data } = await axios.get(`${NPM_REGISTRY}/${pkg}`, { timeout: 5000 });
        const latest = data['dist-tags']?.latest;
        const keywords = data.keywords || [];

        await catalogService.findOrCreateBySlug(pkg, {
          nombre: pkg,
          tipo: detectType(data, keywords),
          lenguaje: 'javascript',
          ecosistema: 'npm',
          categoria: categorizeJs(pkg, data.description || ''),
          descripcion: data.description || '',
          logo_url: getLogoUrl(pkg),
          repo_url: data.repository?.url?.replace('git+', '')?.replace('.git', '') || null,
          docs_url: data.homepage || null,
          homepage_url: data.homepage || null,
          version: latest || null,
          stats: JSON.stringify({
            version: latest || null,
            license: data.license || null,
          }),
          tags: keywords.slice(0, 15),
          key_features: [],
          use_cases: [],
          installation: `npm install ${pkg}`,
        });

        log.items_synced++;
        await sleep(100);
      } catch (e) {
        // skip not found packages
      }
    }

    for (const term of SEARCH_TERMS) {
      try {
        const { data } = await axios.get(NPM_SEARCH, {
          params: { text: term, size: 10 },
          timeout: 5000,
        });

        for (const item of data.objects || []) {
          try {
            const pkg = item.package;
            const existing = await db('technologies').where({ slug: pkg.name }).first();
            if (existing) continue;

            await catalogService.findOrCreateBySlug(pkg.name, {
              nombre: pkg.name,
              tipo: detectType(pkg, pkg.keywords || []),
              lenguaje: 'javascript',
              ecosistema: 'npm',
              categoria: categorizeJs(pkg.name, pkg.description || ''),
              descripcion: pkg.description || '',
              logo_url: getLogoUrl(pkg.name),
              repo_url: pkg.links?.repository || null,
              docs_url: pkg.links?.homepage || null,
              homepage_url: pkg.links?.homepage || null,
              version: pkg.version || null,
              stats: JSON.stringify({
                version: pkg.version || null,
                quality: item.score?.detail?.quality,
                popularity: item.score?.detail?.popularity,
              }),
              tags: (pkg.keywords || []).slice(0, 15),
              key_features: [],
              use_cases: [],
              installation: `npm install ${pkg.name}`,
            });

            log.items_synced++;
          } catch (e) {
            // skip
          }
        }
        await sleep(200);
      } catch (e) {
        console.error(`npm search sync error for ${term}:`, e.message);
      }
    }
  } catch (err) {
    log.status = 'error';
    log.error_message = err.message;
  } finally {
    await db('sync_logs').insert(log);
  }

  return log;
}

function detectType(data, keywords) {
  const kw = keywords.map(k => k.toLowerCase());
  const desc = (data.description || '').toLowerCase();
  if (kw.includes('framework') || desc.includes('framework')) return 'framework';
  if (kw.includes('cli') || kw.includes('tool')) return 'herramienta';
  return 'libreria';
}

function categorizeJs(name, desc) {
  const lower = name.toLowerCase() + ' ' + desc.toLowerCase();
  if (lower.includes('web-framework') || lower.includes('express') || lower.includes('fastify') || lower.includes('koa')) return 'web-framework';
  if (lower.includes('react') || lower.includes('vue') || lower.includes('angular') || lower.includes('svelte') || lower.includes('frontend') || lower.includes('ui')) return 'ui';
  if (lower.includes('test') || lower.includes('jest') || lower.includes('mocha') || lower.includes('cypress')) return 'testing';
  if (lower.includes('http') || lower.includes('fetch') || lower.includes('axios') || lower.includes('request')) return 'http-client';
  if (lower.includes('database') || lower.includes('orm') || lower.includes('mongoose') || lower.includes('sequelize') || lower.includes('prisma')) return 'database';
  if (lower.includes('auth') || lower.includes('jwt') || lower.includes('passport') || lower.includes('bcrypt')) return 'auth';
  if (lower.includes('log') || lower.includes('winston') || lower.includes('pino')) return 'logging';
  if (lower.includes('validate') || lower.includes('validation') || lower.includes('joi') || lower.includes('zod')) return 'validation';
  if (lower.includes('cache') || lower.includes('redis')) return 'cache';
  if (lower.includes('queue') || lower.includes('bull')) return 'queue';
  if (lower.includes('email') || lower.includes('mail') || lower.includes('nodemailer')) return 'email';
  if (lower.includes('cli') || lower.includes('commander') || lower.includes('yargs')) return 'cli';
  if (lower.includes('scheduler') || lower.includes('cron') || lower.includes('agenda')) return 'scheduler';
  if (lower.includes('websocket') || lower.includes('socket')) return 'websocket';
  if (lower.includes('graphql')) return 'graphql';
  if (lower.includes('image') || lower.includes('sharp')) return 'image';
  if (lower.includes('pdf')) return 'pdf';
  if (lower.includes('csv') || lower.includes('excel')) return 'csv';
  if (lower.includes('file') || lower.includes('upload') || lower.includes('multer')) return 'files';
  if (lower.includes('security') || lower.includes('helmet')) return 'security';
  if (lower.includes('monitor') || lower.includes('performance')) return 'monitoring';
  return 'utility';
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = { syncNpm };
