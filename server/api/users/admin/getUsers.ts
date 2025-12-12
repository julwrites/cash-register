// server/api/admin/getUsers.ts
import { defineEventHandler, createError } from 'h3';
import jwt from 'jsonwebtoken';
import type { User } from '../users-db';
import { initializeDatabase } from '../users-db';

const secretKey = process.env.AUTH_SECRET;

export default defineEventHandler(async (event) => {
  const token = event.req.headers.authorization?.split(' ')[1];
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, secretKey) as any;
    if (!decoded.isAdmin) {
      throw createError({ statusCode: 403, statusMessage: 'Forbidden' });
    }

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
