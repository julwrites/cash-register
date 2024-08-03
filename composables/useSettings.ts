// composables/useSettings.ts
import { ref } from 'vue';
import { Database } from 'duckdb-async'; // Import the DuckDB library for data storage

interface Setting {
  key: string;
  value: any;
}

export function useSettings() {
  const settings = ref<Setting[]>([]);

  async function initializeDatabase() {
    const db = await Database.create('settings.db'); // Specify the database file path for storing setting data

    // Create the settings table if it doesn't exist
    await db.exec(
      `CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT)`
    );
  }

  async function fetchSettings(): Promise<void> {
    const db = await Database.create('settings.db');

    // Fetch all settings from the database and update the `settings` ref
    const results = await db.all(`SELECT * FROM settings`) as Setting[];
    settings.value = results;
  }

  async function getSetting(key: string): Promise<any | null> {
    const setting = settings.value.find((s) => s.key === key);
    if (setting) {
      return JSON.parse(setting.value);
    }
    return null;
  }

  async function setSetting(key: string, value: any): Promise<void> {
    const db = await Database.create('settings.db');

    // Serialize the value before storing it in the database
    const serializedValue = JSON.stringify(value);

    // Insert or update the setting in the database
    await db.run(`INSERT OR REPLACE INTO settings (key, value) VALUES ($1, $2)`, [
      key,
      serializedValue,
    ]);

    // Fetch the updated list of settings after modifying one
    fetchSettings();
  }

  async function removeSetting(key: string): Promise<void> {
    const db = await Database.create('settings.db');

    // Remove a setting from the database by its key
    await db.run(`DELETE FROM settings WHERE key = $1`, [key]);

    // Fetch the updated list of settings after removing one
    fetchSettings();
  }

  async function resetDatabase() {
    const db = await Database.create('settings.db');

    // Delete all records from the settings table
    await db.run(`DELETE FROM settings`);

    // Clear the `settings` ref
    settings.value = [];
  }

  return {
    initializeDatabase,
    fetchSettings,
    getSetting,
    setSetting,
    removeSetting,
    resetDatabase,
  };
}