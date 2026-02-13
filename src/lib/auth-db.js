import fs from 'node:fs/promises';
import path from 'node:path';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'auth.db');
const SCHEMA_FILE = path.join(process.cwd(), 'db', 'schema.sql');

let dbPromise;

async function initializeDb() {
  await fs.mkdir(DB_DIR, { recursive: true });

  const db = await open({
    filename: DB_FILE,
    driver: sqlite3.Database,
  });

  const schema = await fs.readFile(SCHEMA_FILE, 'utf8');
  await db.exec(schema);
  await ensureUsersColumns(db);

  return db;
}

async function ensureUsersColumns(db) {
  const columns = await db.all('PRAGMA table_info(users)');
  const names = new Set(columns.map((column) => column.name));

  if (!names.has('wallet_json')) {
    await db.exec('ALTER TABLE users ADD COLUMN wallet_json TEXT');
  }
  if (!names.has('positions_json')) {
    await db.exec('ALTER TABLE users ADD COLUMN positions_json TEXT');
  }
}

export function getDb() {
  if (!dbPromise) {
    dbPromise = initializeDb();
  }
  return dbPromise;
}
