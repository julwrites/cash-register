import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';
import ExpenseForm from '../../pages/components/ExpenseForm.vue';

const toastAdd = vi.fn();

mockNuxtImport('useToast', () => {
  return () => ({
    add: toastAdd
  });
});

describe('ExpenseForm', () => {
  const defaultProps = {
    expense: {
      id: undefined,
      date: '',
      category: '',
      description: '',
      amount: 0,
      debit: 0,
      credit: 0,
    },
    submitButtonText: 'Add Expense',
  };

  beforeEach(() => {
    toastAdd.mockClear();
  });

  it('renders correctly', async () => {
    const component = await mountSuspended(ExpenseForm, {
      props: defaultProps,
    });
    expect(component.exists()).toBe(true);
  });

  it('shows validation error when fields are empty', async () => {
    const component = await mountSuspended(ExpenseForm, {
      props: defaultProps,
    });

    await component.find('form').trigger('submit');

    expect(toastAdd).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Validation Error',
        color: 'red'
    }));
    expect(component.emitted('submit')).toBeFalsy();
  });

  it('emits submit event with valid data', async () => {
     const component = await mountSuspended(ExpenseForm, {
      props: defaultProps,
    });

    // Set data directly
    component.vm.expenseData.date = '2023-10-27';
    component.vm.expenseData.category = 'Food';
    component.vm.expenseData.description = 'Lunch';
    component.vm.expenseData.debit = 100;

    await component.find('form').trigger('submit');

    expect(component.emitted('submit')).toBeTruthy();
    expect(component.emitted('submit')![0][0]).toMatchObject({
        date: '2023-10-27',
        debit: 100,
        category: 'Food',
        description: 'Lunch'
    });
  });
});
