// /Users/julianteh/julwrites/cash-register/server/api/categories/[id].ts

import { defineEventHandler, createError, readBody } from 'h3';
import { getDb } from './categories-db';

export default defineEventHandler(async (event) => {
  const method = event.node.req.method;
  const id = event.context.params?.id;
  const db = getDb();

  if (method === 'DELETE') {
    const result = db.prepare('DELETE FROM categories WHERE id = ?').run(id);

    if (result.changes === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Category not found',
      });
    }

    return { message: 'Category deleted successfully' };
  }

  if (method === 'PUT') {
    const updateData = await readBody(event);

    if (!updateData.name) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Category name is required',
      });
    }

    const category = db
      .prepare('SELECT * FROM categories WHERE id = ?')
      .get(id) as any;

    if (!category) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Category not found',
      });
    }

    // No operation if same name
    if (updateData.name === category.name) {
      return category;
    }

    const result = db
      .prepare(
        `
      UPDATE categories 
      SET name = ?
      WHERE id = ?
    `
      )
      .run(updateData.name, id);

    if (result.changes === 0) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to update category',
      });
    }

    const updatedCategory = db
      .prepare('SELECT * FROM categories WHERE id = ?')
      .get(id);

    return updatedCategory;
  }
});
