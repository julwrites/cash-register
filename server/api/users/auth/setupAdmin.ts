// server/api/users/auth/setupAdmin.ts

import { defineEventHandler, readBody, createError } from 'h3';
import { getServerSession } from '#auth';
import { getDb } from '../users-db';

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
