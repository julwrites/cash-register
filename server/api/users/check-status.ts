import { defineEventHandler, readBody } from 'h3';
import type { User } from './users-db';
import { getDb } from './users-db';

export default defineEventHandler(async (event) => {
  const { username } = await readBody(event);
  const db = getDb();
  const user = db
    .prepare('SELECT * FROM users WHERE username = ?')
    .get(username) as User & { password?: string };

  if (!user) {
    return { userExists: false };
  }

  if (!user.is_approved || !user.password) {
    return {
      userExists: true,
      needsPasswordReset: true,
      userId: user.id,
    };
  }

  return { userExists: true, needsPasswordReset: false };
});
