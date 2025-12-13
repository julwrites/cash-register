import { describe, it, expect, beforeEach } from 'vitest';
import { setup, $fetch } from '@nuxt/test-utils';

describe('Auth Setup API', async () => {
  await setup({});

  it('should allow setting up the first admin user', async () => {
    // Ensure DB is empty
    const { getDb } = await import('../../server/api/users/users-db');
    const db = getDb();
    db.prepare('DELETE FROM users').run();

    const response: any = await $fetch('/api/users/auth/setupAdmin', {
        method: 'POST',
        body: { username: 'admin', password: 'password123' }
    });

    expect(response.success).toBe(true);

    const user = db.prepare('SELECT * FROM users WHERE username = ?').get('admin') as any;
    expect(user).toBeDefined();
    expect(user.is_admin).toBe(1);
    expect(user.is_approved).toBe(1);
    // Password should be hashed
    expect(user.password).not.toBe('password123');
    expect(user.password).toMatch(/^\$2[ayb]\$.{56}$/); // Basic bcrypt regex
  });

  it('should fail if users already exist', async () => {
      const { getDb } = await import('../../server/api/users/users-db');
      const db = getDb();

      // Ensure we have a clean state first
      db.prepare('DELETE FROM users').run();

      // Insert one user
      db.prepare('INSERT INTO users (username, password, is_admin, is_approved) VALUES (?, ?, ?, ?)').run('existing', 'hash', 0, 0);

      try {
          await $fetch('/api/users/auth/setupAdmin', {
            method: 'POST',
            body: { username: 'admin2', password: 'password123' }
          });
          expect.fail('Should have thrown 403');
      } catch (e: any) {
          expect(e.response.status).toBe(403);
      }
  });
});
