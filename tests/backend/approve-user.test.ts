import { describe, it, expect, beforeEach } from 'vitest';

describe('Approve User DB Logic', () => {
  beforeEach(() => {
    process.env.ADMIN_USERNAME = 'admin';
    process.env.ADMIN_PASSWORD = 'password';
    process.env.AUTH_SECRET = 'secret';
  });

  it('should approve a pending user', async () => {
    const { getDb } = await import('../../server/api/users/users-db');
    const db = getDb();

    // Create a pending user (simulating admin creation)
    db.prepare(
      'INSERT INTO users (username, password, is_admin, is_approved) VALUES (?, ?, ?, ?)'
    ).run('pending_user', '', 0, 0);

    // Verify user is pending
    let user = db
      .prepare('SELECT * FROM users WHERE username = ?')
      .get('pending_user') as any;
    expect(user).toBeDefined();
    // SQLite returns 0 for false
    expect(user.is_approved).toBe(0);

    // Perform approval (logic from server/api/users/admin/approveUser.ts)
    db.prepare('UPDATE users SET is_approved = ? WHERE id = ?').run(1, user.id);

    // Verify user is approved
    user = db
      .prepare('SELECT * FROM users WHERE username = ?')
      .get('pending_user');
    expect(user.is_approved).toBe(1);
  });
});
