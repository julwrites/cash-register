import { afterAll } from 'vitest'
import fs from 'fs'
import path from 'path'

// Use a unique temp directory for each test run
const tempDir = path.join(process.cwd(), 'tests', 'temp-data-' + Date.now())

console.log('Setting up temp data dir (top-level):', tempDir)
process.env.DATA_DIR = tempDir
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true })
}

afterAll(() => {
  console.log('Cleaning up temp data dir:', tempDir)
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true })
  }
})
