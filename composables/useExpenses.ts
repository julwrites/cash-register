// composables/useExpenses.ts
import { ref, computed } from 'vue';
import { Database } from 'duckdb-async'; // Import the DuckDB library for data storage

interface Expense {
  id: number;
  description: string;
  amount: number;
  date: string;
}

export function useExpenses() {
  const expenses = ref<Expense[]>([]);

  async function initializeDatabase() {
    const db = await Database.create('expenses.db'); // Specify the database file path for storing expense data

    // Create the expenses table if it doesn't exist
    await db.exec(
      `CREATE TABLE IF NOT EXISTS expenses (id INTEGER PRIMARY KEY, description TEXT, amount REAL, date DATE)`
    );
  }

  async function fetchExpenses(): Promise<void> {
    const db = await Database.create('expenses.db');

    // Fetch all expenses from the database and update the `expenses` ref
    const results = await db.all(`SELECT * FROM expenses ORDER BY date DESC`) as Expense[];
    expenses.value = results;
  }

  async function addExpense(description: string, amount: number): Promise<void> {
    const db = await Database.create('expenses.db');

    // Insert a new expense into the database with the current date
    const currentDate = new Date().toISOString().split('T')[0];
    await db.run(`INSERT INTO expenses (description, amount, date) VALUES ($1, $2, $3)`, [
      description,
      amount,
      currentDate,
    ]);

    // Fetch the updated list of expenses after adding a new one
    fetchExpenses();
  }

  async function removeExpense(id: number): Promise<void> {
    const db = await Database.create('expenses.db');

    // Remove an expense from the database by its ID
    await db.run(`DELETE FROM expenses WHERE id = $1`, [id]);

    // Fetch the updated list of expenses after removing one
    fetchExpenses();
  }

  const totalExpenses = computed(() => {
    return expenses.value.reduce((total, expense) => total + expense.amount, 0);
  });

  const averageExpense = computed(() => {
    if (expenses.value.length === 0) {
      return 0;
    }
    return totalExpenses.value / expenses.value.length;
  });

  async function resetDatabase() {
    const db = await Database.create('expenses.db');

    // Delete all records from the expenses table
    await db.run(`DELETE FROM expenses`);

    // Clear the `expenses` ref
    expenses.value = [];
  }

  return {
    expenses,
    initializeDatabase,
    fetchExpenses,
    addExpense,
    removeExpense,
    totalExpenses,
    averageExpense,
    resetDatabase,
  };
}