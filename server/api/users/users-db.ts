import { existsSync, mkdirSync } from 'fs';
import Database from 'better-sqlite3';
import * as path from 'path';
import bcrypt from 'bcrypt';

const dataDir = process.env.DATA_DIR || path.join(process.cwd(), 'data');
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

const databasePath = path.join(dataDir, 'users.sqlite');
export const secretKey = process.env.AUTH_SECRET;
export const adminUsername = process.env.ADMIN_USERNAME;
export const adminPassword = process.env.ADMIN_PASSWORD;

let dbInstance: Database.Database | null = null;

export const getDb = (): Database.Database => {
  if (dbInstance) return dbInstance;

  console.log('Initializing users database connection');
  try {
    const db = new Database(databasePath);
    console.log('Connected to the users database');

    db.prepare(
      `
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username VARCHAR(50) UNIQUE,
          password TEXT,
          is_admin BOOLEAN DEFAULT FALSE,
          is_approved BOOLEAN DEFAULT TRUE
        );
      `
    ).run();

    // Check if admin user exists, if not, create it
    if (adminUsername && adminPassword) {
      const adminUser = db
        .prepare('SELECT * FROM users WHERE username = ?')
        .get(adminUsername) as any;

      if (!adminUser) {
        const hashedPassword = bcrypt.hashSync(adminPassword, 10);
        db.prepare(
          'INSERT INTO users (username, password, is_admin, is_approved) VALUES (?, ?, ?, ?)'
        ).run(adminUsername, hashedPassword, 1, 1);
        console.log('Admin user created successfully.');
      } else {
        // Check if password is truncated (bcrypt hashes are 60 chars)
        const password = adminUser.password || '';
        if (password.length < 60) {
          console.log('Admin user password appears truncated, rehashing...');
          const hashedPassword = bcrypt.hashSync(adminPassword, 10);
          db.prepare(
            'UPDATE users SET password = ? WHERE username = ?'
          ).run(hashedPassword, adminUsername);
          console.log('Admin user password updated.');
        }
      }
    }

    dbInstance = db;
    return db;
  } catch (err) {
    console.error('Error opening database', err);
    throw err;
  }
};

export interface User {
  id: number;
  username: string;
  is_approved: boolean;
}
