// server/api/users/auth/setupAdmin.ts

import { defineEventHandler, readBody, createError } from 'h3';
import { getServerSession } from '#auth';
import { initializeDatabase } from '../users-db';

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event);

  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  if (!session.user.isAdmin) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' });
  }

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
