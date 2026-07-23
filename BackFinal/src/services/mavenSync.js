const axios = require('axios');
const db = require('../config/database');
const catalogService = require('../modules/catalog/catalog.service');
const { getLogoUrl } = require('./logoService');

const MAVEN_SEARCH = 'https://search.maven.org/solrsearch/select';

function mavenQuery(q, rows = 1) {
  return axios.get(`${MAVEN_SEARCH}?q=${encodeURIComponent(q)}&rows=${rows}&wt=json`);
}

const POPULAR_JAVA = [
  'com.google.guava:guava',
  'org.apache.commons:commons-lang3',
  'com.fasterxml.jackson.core:jackson-databind',
  'org.slf4j:slf4j-api',
  'ch.qos.logback:logback-classic',
  'org.springframework.boot:spring-boot-starter-web',
  'org.springframework.boot:spring-boot-starter-data-jpa',
  'org.projectlombok:lombok',
  'com.squareup.okhttp3:okhttp',
  'io.reactivex.rxjava3:rxjava',
  'org.junit.jupiter:junit-jupiter',
  'io.mockit:mockito-core',
  'org.apache.logging.log4j:log4j-core',
  'com.google.protobuf:protobuf-java',
  'org.apache.httpcomponents.client5:httpclient5',
  'io.netty:netty-all',
  'com.zaxxer:HikariCP',
  'org.flywaydb:flyway-core',
  'com.querydsl:querydsl-jpa',
  'org.mapstruct:mapstruct',
  'com.fasterxml.jackson.core:jackson-core',
  'com.fasterxml.jackson.core:jackson-annotations',
  'org.springframework:spring-core',
  'org.springframework:spring-web',
  'org.springframework:spring-context',
  'com.google.code.gson:gson',
  'com.google.inject:guice',
  'org.hibernate.orm:hibernate-core',
  'io.springfox:springfox-boot-starter',
  'org.springdoc:springdoc-openapi-starter-webmvc-ui',
  'com.auth0:java-jwt',
  'io.jsonwebtoken:jjwt-api',
  'org.apache.kafka:kafka-clients',
  'com.rabbitmq:amqp-client',
  'org.redisson:redisson',
  'com.mongodb:mongodb-driver-sync',
  'org.elasticsearch.client:elasticsearch-rest-client',
  'com.amazonaws:aws-java-sdk-s3',
  'com.google.cloud:google-cloud-storage',
  'org.tensorflow:tensorflow',
  'org.apache.spark:spark-core',
];

async function syncMaven() {
  const log = { fuente: 'maven', status: 'success', items_synced: 0, error_message: null };

  try {
    for (const artifact of POPULAR_JAVA) {
      try {
        const [groupId, artifactId] = artifact.split(':');
        const { data } = await mavenQuery(`g:${groupId} AND a:${artifactId}`, 1);

        const doc = data.response?.docs?.[0];
        if (!doc) continue;

        const slug = artifactId;
        await catalogService.findOrCreateBySlug(slug, {
          nombre: artifactId,
          tipo: detectType(doc),
          lenguaje: 'java',
          ecosistema: 'maven',
          categoria: categorizeJava(artifactId, doc.description || ''),
          descripcion: doc.description || '',
          logo_url: getLogoUrl(slug),
          repo_url: `https://github.com/search?q=${encodeURIComponent(artifact)}`,
          docs_url: `https://search.maven.org/artifact/${groupId}/${artifactId}/${doc.latestVersion}/jar`,
          homepage_url: null,
          version: doc.latestVersion || null,
          stats: JSON.stringify({
            group_id: groupId,
            artifact_id: artifactId,
            versions: doc.versionCount || 0,
          }),
          tags: doc.tags || [],
          key_features: [],
          use_cases: [],
          installation: `<dependency>\n  <groupId>${groupId}</groupId>\n  <artifactId>${artifactId}</artifactId>\n  <version>${doc.latestVersion || '{version}'}</version>\n</dependency>`,
        });

        log.items_synced++;
        await sleep(200);
      } catch (e) {
        console.error(`maven sync error for ${artifact}:`, e.message);
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

function detectType(doc) {
  const desc = (doc.description || '').toLowerCase();
  const tags = (doc.tags || []).map(t => t.toLowerCase());
  if (tags.includes('framework') || desc.includes('framework')) return 'framework';
  if (tags.includes('library') || desc.includes('library')) return 'libreria';
  return 'libreria';
}

function categorizeJava(name, desc) {
  const lower = name.toLowerCase() + ' ' + desc.toLowerCase();
  if (lower.includes('web') || lower.includes('spring')) return 'web-framework';
  if (lower.includes('test') || lower.includes('junit') || lower.includes('mockito')) return 'testing';
  if (lower.includes('json') || lower.includes('jackson') || lower.includes('gson')) return 'json';
  if (lower.includes('database') || lower.includes('jdbc') || lower.includes('hibernate') || lower.includes('jpa')) return 'database';
  if (lower.includes('http') || lower.includes('okhttp') || lower.includes('client')) return 'http-client';
  if (lower.includes('log') || lower.includes('slf4j') || lower.includes('logback')) return 'logging';
  if (lower.includes('security') || lower.includes('auth') || lower.includes('jwt')) return 'security';
  if (lower.includes('cache') || lower.includes('redis')) return 'cache';
  if (lower.includes('queue') || lower.includes('kafka') || lower.includes('rabbit')) return 'queue';
  if (lower.includes('validation')) return 'validation';
  if (lower.includes('email') || lower.includes('mail')) return 'email';
  return 'utility';
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = { syncMaven };
