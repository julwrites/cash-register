import { afterAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import { registerEndpoint } from '@nuxt/test-utils/runtime';

// Mock the auth session endpoint
registerEndpoint('/api/auth/session', () => ({
  user: {
    name: 'Test User',
    email: 'test@example.com',
  },
  expires: '2025-01-01T00:00:00.000Z',
}));

// Mock categories endpoint
registerEndpoint('/api/categories', () => [
  { id: 1, name: 'Food' },
  { id: 2, name: 'Transport' },
]);

// Mock descriptions endpoint
registerEndpoint('/api/descriptions', () => ['Lunch', 'Bus ticket']);

// Use a unique temp directory for each test run
const tempDir = path.join(
  process.cwd(),
  'tests',
  'temp-data-' + Date.now() + '-' + Math.floor(Math.random() * 100000)
);

console.log('Setting up temp data dir (top-level):', tempDir);
process.env.DATA_DIR = tempDir;
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

afterAll(() => {
  console.log('Cleaning up temp data dir:', tempDir);
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});
