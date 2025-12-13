// /Users/julianteh/julwrites/cash-register/server/api/categories/index.ts

import { defineEventHandler, readBody, createError } from 'h3';
import { getDb } from './categories-db';

export default defineEventHandler(async (event) => {
  const method = event.node.req.method;
  const db = getDb();

  if (method === 'GET') {
    console.log('Categories GET handler called');
    console.log('Before db.all');
    const categories = db.prepare('SELECT * FROM categories').all();
    console.log('After db.all, categories:', categories);
    return categories;
  }

  if (method === 'POST') {
    const newCategory = await readBody(event);

    if (!newCategory.name) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Category name is required',
      });
    }

    const result = db
      .prepare('INSERT INTO categories (name) VALUES (?)')
      .run(newCategory.name);
    const addedCategory = db
      .prepare('SELECT * FROM categories WHERE id = ?')
      .get(result.lastInsertRowid);

    return addedCategory;
  }
});
