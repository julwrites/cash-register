// server/api/users/admin/createUser.ts
import { defineEventHandler, createError, readBody } from 'h3';
import { getDb } from '../users-db';
import { requireAdmin } from '../../../utils/auth';

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  try {
    const { username } = await readBody(event);
    if (!username) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Username is required',
      });
    }

    const db = getDb();

    // Check if user already exists
    const existingUser = db
      .prepare('SELECT * FROM users WHERE username = ?')
      .get(username);
    if (existingUser) {
      throw createError({
        statusCode: 409,
        statusMessage: 'User already exists',
      });
    }

    // Insert new user without a password
    const result = db
      .prepare(
        'INSERT INTO users (username, password, is_admin, is_approved) VALUES (?, ?, ?, ?)'
      )
      .run(username, '', 0, 0);

    const newUser = {
      id: result.lastInsertRowid,
      username: username,
      is_admin: false,
      is_approved: false,
    };

    // TODO: Send notification to the new user with instructions to set their password

    return newUser;
  } catch (error) {
    console.error('Create User API error:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    });
  }
});
