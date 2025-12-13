import { defineEventHandler, readBody, createError } from 'h3';
import { getServerSession } from '#auth';
import bcrypt from 'bcrypt';
import type { User } from '../users-db';
import { initializeDatabase } from '../users-db';

export default defineEventHandler(async (event) => {
  try {
    const session = await getServerSession(event);
    if (!session) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized',
      });
    }

    const { newUsername, newPassword } = await readBody(event);
    const userId = session.user.id;

    const db = await initializeDatabase();

    // Check if user exists
    const user = (await db.get(
      'SELECT * FROM users WHERE id = ?',
      userId
    )) as User & { password?: string };

    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found',
      });
    }

    const hashedNewPassword = newPassword ? await bcrypt.hash(newPassword, 10) : undefined;

    let result;
    if (newUsername === user.username) {
      result = await db.run(
        `
        UPDATE users
        SET password = COALESCE(?, password)
        WHERE id = ?
      `,
        hashedNewPassword || user.password,
        userId
      );
    } else {
      result = await db.run(
        `
        UPDATE users
        SET username = COALESCE(?, username),
            password = COALESCE(?, password)
        WHERE id = ?
      `,
        newUsername || user.username,
        hashedNewPassword || user.password,
        userId
      );
    }

    if (result.changes === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No changes were made',
      });
    }

    return { message: 'Settings updated successfully' };
  } catch (error) {
    console.error('Update settings error:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
      stack: error instanceof Error ? error.stack : undefined,
    });
  }
});
