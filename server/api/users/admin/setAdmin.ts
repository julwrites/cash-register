// server/api/admin/setAdmin.ts

import { defineEventHandler, readBody, createError } from 'h3';
import { initializeDatabase } from '../users-db';
import { requireAdmin } from '../../../utils/auth';

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  try {
    const { userId, is_admin } = await readBody(event);
    const db = await initializeDatabase();

    await db.run(
      'UPDATE users SET is_admin = ? WHERE id = ?',
      is_admin,
      userId
    );

    const updatedUser = await db.get(
      'SELECT id, username, is_admin, is_approved FROM users WHERE id = ?',
      userId
    );
    return updatedUser;
  } catch (error) {
    console.error('Update User API error:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    });
  }
});
