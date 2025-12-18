import { ref } from 'vue';
import { defaultExpense } from './defaultExpense';

interface Expense {
  id: number;
  credit: number;
  debit: number;
  description: string;
  date: string;
  category: string;
}

interface FetchParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  category?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface ExpenseSummary {
  income: number;
  expenses: number;
  byCategory: Record<string, number>;
}

export function useExpenses() {
  const expenses = ref<Expense[]>([]); // For legacy support and charts (all data)
  const entries = ref<any[]>([]); // For legacy support (formatted expenses)
  const loading = ref(false); // New loading state

  const paginatedExpenses = ref<any[]>([]); // Formatted expenses for the current page
  const totalCount = ref(0); // Total count for pagination
  const expenseSummary = ref<ExpenseSummary | null>(null);

  // Fetch all expenses (legacy behavior + support for filters)
  // This is used for Charts which need the full dataset (or filtered dataset) to calculate aggregates
  async function fetchExpenses(params: FetchParams = {}) {
    loading.value = true;
    try {
      const query = new URLSearchParams();
      if (params.startDate) query.append('startDate', params.startDate);
      if (params.endDate) query.append('endDate', params.endDate);
      if (params.category) query.append('category', params.category);
      if (params.sortBy) query.append('sortBy', params.sortBy);
      if (params.sortOrder) query.append('sortOrder', params.sortOrder);

      const response = await fetch(`/api/expenses?${query.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch expenses');
      }

      const data = await response.json();
      // The API returns an array if no pagination params are sent
      // But if we add filters, it might still return array?
      // Yes, my implementation returns array if !page || !limit.

      expenses.value = data;

      entries.value = expenses.value
        .map((expense) => ({
          id: expense.id,
          date: expense.date,
          category: expense.category,
          description: expense.description,
          amount: (expense.credit - expense.debit).toFixed(2),
        }))
        .sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
    } catch (error) {
      console.error('Error fetching expenses:', error);
      throw error; // Re-throw so components can handle it
    } finally {
      loading.value = false;
    }
  }

  // New function for server-side pagination
  async function fetchPaginatedExpenses(params: FetchParams) {
    loading.value = true;
    try {
      const query = new URLSearchParams();
      if (params.page) query.append('page', params.page.toString());
      if (params.limit) query.append('limit', params.limit.toString());
      if (params.startDate) query.append('startDate', params.startDate);
      if (params.endDate) query.append('endDate', params.endDate);
      if (params.category) query.append('category', params.category);

      const response = await fetch(`/api/expenses?${query.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch paginated expenses');
      }

      const data = await response.json();
      // Expecting { data: [], total: number, ... }

      if (data.data) {
        paginatedExpenses.value = data.data.map((expense: Expense) => ({
          id: expense.id,
          date: expense.date,
          category: expense.category,
          description: expense.description,
          amount: (expense.credit - expense.debit).toFixed(2),
          credit: expense.credit,
          debit: expense.debit,
        }));
        // Sorted by backend already

        totalCount.value = data.total;
      } else {
        // Fallback if API returns array (should not happen if page/limit sent)
        paginatedExpenses.value = [];
        totalCount.value = 0;
      }
    } catch (error) {
      console.error('Error fetching paginated expenses:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function fetchExpenseSummary(params: FetchParams = {}) {
    // We might not want to set global loading for this one if it's run in parallel with list
    // But usually they are fetched together. Let's not set loading=true here to avoid flickering if one finishes before other.
    // Or we could have separate loading states. For now, let's just let fetchPaginatedExpenses handle the main loading state if called together.
    // If called independently, it might not show loading. Let's add it but be careful.
    // Actually, `loading` usually implies "fetching data that affects the view".
    // Let's wrapping it in loading too, assuming they are sequential or we don't mind extending the loading time.
    try {
      const query = new URLSearchParams();
      if (params.startDate) query.append('startDate', params.startDate);
      if (params.endDate) query.append('endDate', params.endDate);
      if (params.category) query.append('category', params.category);

      const response = await fetch(`/api/expenses/summary?${query.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch expense summary');
      }

      const data = await response.json();
      expenseSummary.value = data;
    } catch (error) {
      console.error('Error fetching expense summary:', error);
      throw error;
    }
  }

  async function updateExpense(updatedExpense: any) {
    loading.value = true;
    try {
      const year = new Date(updatedExpense.date).getFullYear();
      const response = await fetch(
        `/api/expenses/${year}/${updatedExpense.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedExpense),
        }
      );
      if (!response.ok) {
        throw new Error('Failed to update expense');
      }

      const refreshedExpense = await response.json();

      // Update locally in 'expenses'/Entries (for charts)
      const index = expenses.value.findIndex(
        (expense) => expense.id === refreshedExpense.id
      );
      if (index !== -1) {
        expenses.value.splice(index, 1, refreshedExpense);
      }

      const updatedEntry = {
        ...defaultExpense,
        ...refreshedExpense,
        amount: (refreshedExpense.credit - refreshedExpense.debit).toFixed(2),
      };

      const entryIndex = entries.value.findIndex(
        (e) => e.id === refreshedExpense.id
      );
      if (entryIndex !== -1) {
        entries.value.splice(entryIndex, 1, updatedEntry);
      }

      // Update locally in 'paginatedExpenses'
      const paginatedIndex = paginatedExpenses.value.findIndex(
        (e) => e.id === refreshedExpense.id
      );
      if (paginatedIndex !== -1) {
        paginatedExpenses.value.splice(paginatedIndex, 1, updatedEntry);
      }
    } catch (error) {
      console.error('Error updating expense:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function deleteExpense(id: number) {
    loading.value = true;
    try {
      // We need to find the expense to know the year.
      // It might be in 'expenses' or 'paginatedExpenses'
      let expenseToDelete = expenses.value.find((expense) => expense.id === id);

      // If not in full list (e.g. if we didn't fetch all), check paginated
      if (!expenseToDelete) {
        const entry = paginatedExpenses.value.find((e) => e.id === id);
        if (entry) {
          expenseToDelete = { ...entry, credit: 0, debit: 0 }; // Mock for date access
        }
      }

      if (!expenseToDelete) {
        throw new Error('Expense not found locally');
      }

      const year = new Date(expenseToDelete.date).getFullYear();
      const response = await fetch(`/api/expenses/${year}/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete expense');
      }

      expenses.value = expenses.value.filter((expense) => expense.id !== id);
      entries.value = entries.value.filter((entry) => entry.id !== id);
      paginatedExpenses.value = paginatedExpenses.value.filter(
        (e) => e.id !== id
      );
      // We should technically decrement totalCount but refreshing the list is safer
      totalCount.value--;
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  return {
    expenses,
    entries,
    paginatedExpenses,
    totalCount,
    expenseSummary,
    loading,
    fetchExpenses,
    fetchPaginatedExpenses,
    fetchExpenseSummary,
    updateExpense,
    deleteExpense,
  };
}
