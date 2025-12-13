// server/api/admin/getUsers.ts
import { defineEventHandler, createError } from 'h3';
import type { User } from '../users-db';
import { initializeDatabase } from '../users-db';
import { requireAdmin } from '../../../utils/auth';

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  try {
    console.log('getUsers handler called');
    const db = await initializeDatabase();
    console.log('Before db.all');
    const users = (await db.all(
      'SELECT id, username, is_admin, is_approved FROM users'
    )) as User[];
    console.log('After db.all, users:', users);
    return users;
  } catch (error) {
    console.error('Get Users API error:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    });
  }
});
