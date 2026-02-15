import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '../drizzle/schema.js';

let _db: any = null;

export async function getDb() {
  if (!_db) {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) throw new Error('DATABASE_URL is missing');

    const connection = await mysql.createConnection({
      uri: dbUrl,
      ssl: { rejectUnauthorized: false }
    });
    
    _db = drizzle(connection, { schema });
  }
  return _db;
}
