// server/api/admin/deleteUser.ts

import { defineEventHandler, readBody, createError } from 'h3';
import { initializeDatabase } from '../users-db';
import { requireAdmin } from '../../../utils/auth';

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  try {
    const { userId } = await readBody(event);
    console.log('Removing', userId);
    const db = await initializeDatabase();

    await db.run('DELETE FROM users WHERE id = ?', [userId]);
    return { success: true };
  } catch (error) {
    console.error('Delete User API error:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    });
  }
});
