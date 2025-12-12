import { describe, it, expect, beforeEach } from 'vitest'

describe('Users DB', () => {
  beforeEach(() => {
    process.env.ADMIN_USERNAME = 'admin'
    process.env.ADMIN_PASSWORD = 'password'
    process.env.AUTH_SECRET = 'secret'
  })

  it('should initialize and create admin user', async () => {
    const { default: usersDb } = await import('../../server/api/users/users-db')

    const db = await usersDb.db()
    expect(db).toBeDefined()

    const admin = await usersDb.get('SELECT * FROM users WHERE username = ?', 'admin')
    expect(admin).toBeDefined()
    expect(admin.username).toBe('admin')
    expect(admin.is_admin).toBe(1)
  })

  it('should create a new user', async () => {
    const { default: usersDb } = await import('../../server/api/users/users-db')
    // Ensure we don't duplicate
    try {
      await usersDb.run('INSERT INTO users (username, password) VALUES (?, ?)', 'testuser', 'pass')
    } catch (e) {
      // Ignore if exists
    }
    const user = await usersDb.get('SELECT * FROM users WHERE username = ?', 'testuser')
    expect(user).toBeDefined()
    expect(user.username).toBe('testuser')
  })
})
