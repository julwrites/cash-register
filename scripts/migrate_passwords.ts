import Database from 'better-sqlite3';
import bcrypt from 'bcrypt';
import path from 'path';
import fs from 'fs';

const dataDir = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const dbPath = path.join(dataDir, 'users.sqlite');

if (!fs.existsSync(dbPath)) {
  console.log('No users database found at', dbPath);
  process.exit(0);
}

const db = new Database(dbPath);
const users = db.prepare('SELECT * FROM users').all() as any[];

console.log(`Found ${users.length} users.`);

let updatedCount = 0;

for (const user of users) {
  if (!user.password) continue;

  // Simple check if already hashed (bcrypt hashes start with $2a$, $2b$, or $2y$)
  if (user.password.startsWith('$2b$') || user.password.startsWith('$2a$') || user.password.startsWith('$2y$')) {
    console.log(`User ${user.username} already has hashed password.`);
    continue;
  }

  console.log(`Hashing password for user ${user.username}...`);
  const hashedPassword = bcrypt.hashSync(user.password, 10);

  db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashedPassword, user.id);
  updatedCount++;
}

console.log(`Migration complete. Updated ${updatedCount} users.`);
