// server/api/users/auth/setupAdmin.ts
import { defineEventHandler, readBody, createError } from 'h3';
import { getDb } from '../users-db';
import bcrypt from 'bcrypt';

export default defineEventHandler(async (event) => {
  const { username, password } = await readBody(event);

  if (!username || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Username and password are required',
    });
  }

  const db = getDb();

  // Use a transaction or synchronous logic to prevent race conditions.
  // Since better-sqlite3 is synchronous, we just need to avoid 'await' between check and insert.

  // Calculate hash first (synchronously)
  const hashedPassword = bcrypt.hashSync(password, 10);

  const insertStmt = db.prepare(
    'INSERT INTO users (username, password, is_admin, is_approved) VALUES (?, ?, ?, ?)'
  );

  const checkStmt = db.prepare('SELECT COUNT(*) as count FROM users');

  // Use a transaction to ensure atomicity
  const transaction = db.transaction(() => {
    const userCount = checkStmt.get() as { count: number };

    if (userCount.count > 0) {
       throw createError({
         statusCode: 403,
         statusMessage: 'Setup is only allowed when no users exist',
       });
    }

    const result = insertStmt.run(username, hashedPassword, 1, 1);
    return result;
  });

  try {
      const result = transaction();
      return { success: true, userId: result.lastInsertRowid };
  } catch (error: any) {
      if (error.statusCode === 403) {
          throw error;
      }
      throw createError({
          statusCode: 500,
          statusMessage: 'Internal Server Error',
          cause: error
      });
  }
});
