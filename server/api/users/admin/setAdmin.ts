// server/api/admin/setAdmin.ts

import { defineEventHandler, readBody, createError } from 'h3';
import { getDb } from '../users-db';
import { requireAdmin } from '../../../utils/auth';

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  try {
    const { userId, is_admin } = await readBody(event);
    const db = getDb();

    db.prepare('UPDATE users SET is_admin = ? WHERE id = ?').run(
      is_admin,
      userId
    );

    const updatedUser = db
      .prepare(
        'SELECT id, username, is_admin, is_approved FROM users WHERE id = ?'
      )
      .get(userId);
    return updatedUser;
  } catch (error) {
    console.error('Update User API error:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    });
  }
});
