import { describe, it, expect, beforeEach } from 'vitest';

describe('Approve User DB Logic', () => {
  beforeEach(() => {
    process.env.ADMIN_USERNAME = 'admin';
    process.env.ADMIN_PASSWORD = 'password';
    process.env.AUTH_SECRET = 'secret';
  });

  it('should approve a pending user', async () => {
    const { default: usersDb } =
      await import('../../server/api/users/users-db');

    // Create a pending user (simulating admin creation)
    // Note: SQLite uses 0/1 for booleans, better-sqlite3 throws on boolean types
    await usersDb.run(
      'INSERT INTO users (username, password, is_admin, is_approved) VALUES (?, ?, ?, ?)',
      'pending_user',
      '',
      0,
      0 // is_approved = false
    );

    // Verify user is pending
    let user = await usersDb.get(
      'SELECT * FROM users WHERE username = ?',
      'pending_user'
    );
    expect(user).toBeDefined();
    // SQLite returns 0 for false
    expect(user.is_approved).toBe(0);

    // Perform approval (logic from server/api/users/admin/approveUser.ts)
    await usersDb.run(
      'UPDATE users SET is_approved = ? WHERE id = ?',
      1,
      user.id
    );

    // Verify user is approved
    user = await usersDb.get(
      'SELECT * FROM users WHERE username = ?',
      'pending_user'
    );
    expect(user.is_approved).toBe(1);
  });
});
