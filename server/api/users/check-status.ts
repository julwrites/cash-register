import { defineEventHandler, readBody } from 'h3';
import { initializeDatabase, User } from './users-db';

export default defineEventHandler(async (event) => {
  const { username } = await readBody(event);
  const db = await initializeDatabase();
  const user = (await db.get('SELECT * FROM users WHERE username = ?', [
    username,
  ])) as User & { password?: string };

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
