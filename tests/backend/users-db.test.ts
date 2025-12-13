import { describe, it, expect, beforeEach } from 'vitest';

describe('Users DB', () => {
  beforeEach(() => {
    process.env.ADMIN_USERNAME = 'admin';
    process.env.ADMIN_PASSWORD = 'password';
    process.env.AUTH_SECRET = 'secret';
  });

  it('should initialize and create admin user', async () => {
    const { getDb } = await import('../../server/api/users/users-db');

    const db = getDb();
    expect(db).toBeDefined();

    const admin = db
      .prepare('SELECT * FROM users WHERE username = ?')
      .get('admin') as any;
    expect(admin).toBeDefined();
    expect(admin.username).toBe('admin');
    expect(admin.is_admin).toBe(1);
  });

  it('should create a new user', async () => {
    const { getDb } = await import('../../server/api/users/users-db');
    const db = getDb();
    // Ensure we don't duplicate
    try {
      db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run(
        'testuser',
        'pass'
      );
    } catch {
      // Ignore if exists
    }
    const user = db
      .prepare('SELECT * FROM users WHERE username = ?')
      .get('testuser') as any;
    expect(user).toBeDefined();
    expect(user.username).toBe('testuser');
  });
});
