// /Users/julianteh/julwrites/cash-register/server/api/expenses/[year]/[id].ts

import { defineEventHandler, readBody, createError } from 'h3';
import type { Expense } from '../expenses-db';
import { getDb } from '../expenses-db';
import { trackDescriptionUsage } from '../../descriptions/descriptions-db';

export default defineEventHandler(async (event) => {
  const method = event.node.req.method;
  const year = parseInt(event.context.params.year);
  const id = event.context.params?.id;
  const db = getDb(year);

  // GET: Fetch a single expense
  if (method === 'GET') {
    const expense = db
      .prepare('SELECT * FROM expenses WHERE id = ?')
      .get(id) as Expense;
    if (!expense) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Expense not found',
      });
    }
    return expense;
  }

  // PUT: Update an expense
  if (method === 'PUT') {
    const updatedExpense: Expense = await readBody(event);
    const newYear = new Date(updatedExpense.date).getFullYear();

    if (year === newYear) {
      // Year has not changed, just update the expense
      const result = db
        .prepare(
          `
        UPDATE expenses
        SET credit = ?, debit = ?, description = ?, date = ?, category = ?
        WHERE id = ?
      `
        )
        .run(
          updatedExpense.credit || 0,
          updatedExpense.debit || 0,
          updatedExpense.description,
          updatedExpense.date,
          updatedExpense.category,
          id
        );

      if (result.changes === 0) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Expense not found',
        });
      }

      // Track description usage
      if (updatedExpense.description) {
        trackDescriptionUsage(
          updatedExpense.description,
          updatedExpense.category
        );
      }

      return { id: Number(id), ...updatedExpense };
    } else {
      // Year has changed, so we need to move the expense to a new database
      const oldDb = getDb(year);
      const newDb = getDb(newYear);

      // 1. Delete from the old database
      const deleteResult = oldDb
        .prepare('DELETE FROM expenses WHERE id = ?')
        .run(id);

      if (deleteResult.changes === 0) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Expense not found in the old year database',
        });
      }

      // 2. Insert into the new database
      const insertResult = newDb
        .prepare(
          `
        INSERT INTO expenses (id, credit, debit, description, date, category)
        VALUES (?, ?, ?, ?, ?, ?)
      `
        )
        .run(
          id,
          updatedExpense.credit || 0,
          updatedExpense.debit || 0,
          updatedExpense.description,
          updatedExpense.date,
          updatedExpense.category
        );

      // Track description usage
      if (updatedExpense.description) {
        trackDescriptionUsage(
          updatedExpense.description,
          updatedExpense.category
        );
      }

      return { id: insertResult.lastInsertRowid, ...updatedExpense };
    }
  }

  // DELETE: Delete an expense
  if (method === 'DELETE') {
    const result = db.prepare('DELETE FROM expenses WHERE id = ?').run(id);

    if (result.changes === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Expense not found',
      });
    }

    console.log(`Expense with ID ${id} deleted successfully`);

    return { message: 'Expense deleted successfully' };
  }
});
