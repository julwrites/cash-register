// server/api/users/auth/checkFirstUser.ts
import { defineEventHandler } from 'h3';
import { getDb } from '../users-db';

export default defineEventHandler(async (_event) => {
  const db = getDb();

  // Check if there are any users in the database
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as {
    count: number;
  };

  return { isFirstUser: userCount.count === 0 };
});
