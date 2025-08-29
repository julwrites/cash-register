// users-db.ts
import { existsSync, mkdirSync } from 'fs';
import Database from 'better-sqlite3';
import * as path from 'path';

const dataDir = path.join(process.cwd(), 'data');
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

const databasePath = path.join(dataDir, 'users.sqlite');
export const secretKey = process.env.AUTH_SECRET;
export const adminUsername = process.env.ADMIN_USERNAME;
export const adminPassword = process.env.ADMIN_PASSWORD;

let db: any;

interface DatabaseOperations {
  run: (...args: any[]) => Promise<any>;
  get: (...args: any[]) => Promise<any>;
  all: (...args: any[]) => Promise<any>;
  db: any;
}

export const initializeDatabase = (): Promise<DatabaseOperations> => {
  return new Promise((resolve: (value: DatabaseOperations) => void, reject) => {
    try {
      db = new Database(databasePath);
      console.log('Connected to the users database');
      
      // better-sqlite3 is synchronous, so we just wrap in promises
      const dbRun = (...args: any[]) => {
        return new Promise((resolve, reject) => {
          try {
            const result = db.prepare(args[0]).run(...args.slice(1));
            resolve(result);
          } catch (err) {
            reject(err);
          }
        });
      };
      
      const dbGet = (...args: any[]) => {
        return new Promise((resolve, reject) => {
          try {
            const result = db.prepare(args[0]).get(...args.slice(1));
            resolve(result);
          } catch (err) {
            reject(err);
          }
        });
      };
      
      const dbAll = (...args: any[]) => {
        return new Promise((resolve, reject) => {
          try {
            const result = db.prepare(args[0]).all(...args.slice(1));
            resolve(result);
          } catch (err) {
            reject(err);
          }
        });
      };
      dbRun(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username VARCHAR(50) UNIQUE,
          password VARCHAR(50),
          is_admin BOOLEAN DEFAULT FALSE,
          is_approved BOOLEAN DEFAULT TRUE
        );
      `).then(() => {
        // Check if admin user exists, if not, create it
        dbGet('SELECT * FROM users WHERE username = ?', adminUsername)
          .then(adminUser => {
            if (!adminUser && adminUsername && adminPassword) {
              dbRun(
                'INSERT INTO users (username, password, is_admin, is_approved) VALUES (?, ?, ?, ?)',
                adminUsername,
                adminPassword,
                1,
                1
              ).then(() => {
                console.log('Admin user created successfully.');
                resolve({
                  run: dbRun,
                  get: dbGet,
                  all: dbAll,
                  db
                });
              }).catch(err => {
                console.error('Error creating admin user', err);
                reject(err);
              });
            } else {
              resolve({
                run: dbRun,
                get: dbGet,
                all: dbAll,
                db
              });
        }
          }).catch(err => {
            console.error('Error checking admin user', err);
            reject(err);
          });
      }).catch(err => {
        console.error('Error creating table', err);
        reject(err);
      });
    } catch (err) {
      console.error('Error opening database', err);
      reject(err);
    }
  });
};
export interface User {
  id: number;
  username: string;
  is_approved: boolean;
}

interface DatabaseOperations {
  run: (...args: any[]) => Promise<any>;
  get: (...args: any[]) => Promise<any>;
  all: (...args: any[]) => Promise<any>;
  db: any;
}

const dbPromise: Promise<DatabaseOperations> = initializeDatabase();

export default {
  run: async (...args: any[]) => (await dbPromise).run(...args),
  get: async (...args: any[]) => (await dbPromise).get(...args),
  all: async (...args: any[]) => (await dbPromise).all(...args),
  db: async () => (await dbPromise).db
};
