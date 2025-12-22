import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';
import ExpenseForm from '@/components/ExpenseForm.vue';
import { defaultExpense } from '@/composables/defaultExpense';

const toastAdd = vi.fn();

mockNuxtImport('useToast', () => {
  return () => ({
    add: toastAdd,
  });
});

describe('ExpenseForm Reset', () => {
  const defaultProps = {
    expense: { ...defaultExpense },
    submitButtonText: 'Add Expense',
  };

  beforeEach(() => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      })
    ) as any;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('resets description after submit', async () => {
    const component = await mountSuspended(ExpenseForm, {
      props: defaultProps,
    });

    // Set data
    component.vm.expenseData.date = '2023-10-27';
    component.vm.expenseData.category = 'Food';
    component.vm.expenseData.description = 'Lunch';
    component.vm.expenseData.debit = 100;

    // Call handleSubmit directly
    await (component.vm as any).handleSubmit();

    // Check if emit happened
    expect(component.emitted('submit')).toBeTruthy();

    // Check if description is reset
    expect(component.vm.expenseData.description).toBe('');

    // Check if other fields are reset
    expect(component.vm.expenseData.debit).toBe(0);
  });
});
