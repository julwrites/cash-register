// composables/useCategories.ts
import { ref } from 'vue';
import { Database } from 'duckdb-async'; // Import the DuckDB library for data storage

interface Category {
  id: number;
  name: string;
}

export function useCategories() {
  const categories = ref<Category[]>([]);

  async function initializeDatabase() {
    const db = await Database.create('categories.db');

    // Create the categories table if it doesn't exist
    await db.exec(
      `CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY, name TEXT)`
    );
  }

  async function getCategories() {
    const db = await Database.create('categories.db');

    // Retrieve all categories from the database and update the ref value
    const result = await db.all(`SELECT * FROM categories`) as Category[];
    categories.value = result;
  }

  async function createCategory(name: string) {
    const db = await Database.create('categories.db');

    // Retrieve the ID of the last inserted row
    // Insert a new category and retrieve its ID in one step
    const result = await db.all(`
        INSERT INTO categories (name) 
        VALUES ($1) 
        RETURNING id
    `, [name]);
    const id = result[0].id;

    // Update the ref value with the newly created category
    categories.value.push({ id, name });
  }

  async function updateCategory(id: number, name: string) {
    const db = await Database.create('categories.db');

    // Update the category name in the database and update the ref value with the updated category
    await db.run(`UPDATE categories SET name = $1 WHERE id = $2`, [name, id]);
    const index = categories.value.findIndex((category) => category.id === id);
    if (index !== -1) {
      categories.value[index].name = name;
    }
  }

  async function deleteCategory(id: number) {
    const db = await Database.create('categories.db');

    // Delete the category from the database and update the ref value by removing the deleted category
    await db.run(`DELETE FROM categories WHERE id = $1`, [id]);
    categories.value = categories.value.filter((category) => category.id !== id);
  }

  return { categories, initializeDatabase, getCategories, createCategory, updateCategory, deleteCategory };
}