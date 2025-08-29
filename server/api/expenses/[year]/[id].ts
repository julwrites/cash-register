// /Users/julianteh/julwrites/cash-register/server/api/expenses/[year]/[id].ts

import { defineEventHandler, readBody, createError } from 'h3';
import { getDb, Expense } from '../expenses-db';

export default defineEventHandler(async (event) => {
  const method = event.node.req.method;
  const year = parseInt(event.context.params.year);
  const id = event.context.params?.id;
  const db = await getDb(year);

  // GET: Fetch a single expense
  if (method === 'GET') {
    const expense = await db.get("SELECT * FROM expenses WHERE id = ?", id) as Expense;
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
      const result = await db.run(`
        UPDATE expenses
        SET credit = ?, debit = ?, description = ?, date = ?, category = ?
        WHERE id = ?
      `, updatedExpense.credit || 0, updatedExpense.debit || 0, updatedExpense.description, updatedExpense.date, updatedExpense.category, id);
      
      if (result.changes === 0) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Expense not found',
        });
      }
      
      return { id: Number(id), ...updatedExpense };
    } else {
      // Year has changed, so we need to move the expense to a new database
      const oldDb = await getDb(year);
      const newDb = await getDb(newYear);

      // 1. Delete from the old database
      const deleteResult = await oldDb.run("DELETE FROM expenses WHERE id = ?", id);

      if (deleteResult.changes === 0) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Expense not found in the old year database',
        });
      }

      // 2. Insert into the new database
      const insertResult = await newDb.run(`
        INSERT INTO expenses (id, credit, debit, description, date, category)
        VALUES (?, ?, ?, ?, ?, ?)
      `, id, updatedExpense.credit || 0, updatedExpense.debit || 0, updatedExpense.description, updatedExpense.date, updatedExpense.category);

      return { id: insertResult.lastID, ...updatedExpense };
    }
  }

  // DELETE: Delete an expense
  if (method === 'DELETE') {
    const result = await db.run("DELETE FROM expenses WHERE id = ?", id);

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
