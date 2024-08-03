// composables/useAuth.ts
import { ref } from 'vue';
import { Database } from 'duckdb-async'; // Import the DuckDB library for data storage
import bcrypt from 'bcryptjs'; // Import the bcrypt library for password hashing and verification

export interface User {
  id: number;
  email: string;
  passwordHash: string;
}

export function useAuth() {
  const isAuthenticated = ref(false);

  async function initializeDatabase() {
    const db = await Database.create('users.db');

    // Create the users table if it doesn't exist
    await db.exec(
      `CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, email TEXT UNIQUE, passwordHash TEXT)`
    );
  }

  async function registerUser(email: string, password: string): Promise<void> {
    const db = await Database.create('users.db');

    // Check if the user with the same email already exists
    const existingUser = await db.all(`SELECT * FROM users WHERE email = $1`, [email]) as User[];
    if (existingUser.length > 0) {
      throw new Error('A user with this email address already exists');
    }

    // Hash the password before storing it in the database
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert a new user into the database with the hashed password
    await db.run(`INSERT INTO users (email, passwordHash) VALUES ($1, $2)`, [email, hashedPassword]);
  }

  async function loginUser(email: string, password: string): Promise<void> {
    const db = await Database.create('users.db');

    // Retrieve the user from the database based on the provided email
    const users = await db.all(`SELECT * FROM users WHERE email = $1`, [email]) as User[];
    if (users.length <= 0) {
      throw new Error('Invalid email or password');
    }

    const user = users[0];

    // Verify the provided password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Set the authentication state to true and store the user's ID in local storage for session management
    isAuthenticated.value = true;
    localStorage.setItem('userId', String(user.id));
  }

  async function logoutUser(): Promise<void> {
    // Set the authentication state to false and remove the user's ID from local storage
    isAuthenticated.value = false;
    localStorage.removeItem('userId');
  }

  return { isAuthenticated, initializeDatabase, registerUser, loginUser, logoutUser };
}