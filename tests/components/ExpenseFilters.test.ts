import { describe, it, expect } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import ExpenseFilters from '../../pages/components/ExpenseFilters.vue';

describe('ExpenseFilters', () => {
  const defaultProps = {
    selectedPeriod: { label: 'This Month', value: 'month' },
    selectedCategory: { label: 'Food', id: 1 },
    categoryOptions: [
      { label: 'Food', id: 1 },
      { label: 'Transport', id: 2 },
    ],
    startDate: '',
    endDate: '',
  };

  it('renders correctly', async () => {
    const component = await mountSuspended(ExpenseFilters, {
      props: defaultProps,
    });
    expect(component.exists()).toBe(true);
    expect(component.text()).toContain('Reset Filters');
  });

  it('emits reset-filters event', async () => {
    const component = await mountSuspended(ExpenseFilters, {
      props: defaultProps,
    });

    await component.find('button.filter-reset').trigger('click');
    expect(component.emitted('reset-filters')).toBeTruthy();
  });

  it('shows date inputs when custom period is selected', async () => {
    const component = await mountSuspended(ExpenseFilters, {
      props: {
        ...defaultProps,
        selectedPeriod: { label: 'Custom Range', value: 'custom' },
      },
    });

    expect(component.find('.date-range-picker').exists()).toBe(true);
    expect(component.findAll('input[type="date"]').length).toBe(2);
  });

  it('emits update events when date changes', async () => {
    const component = await mountSuspended(ExpenseFilters, {
      props: {
        ...defaultProps,
        selectedPeriod: { label: 'Custom Range', value: 'custom' },
        startDate: '2023-01-01',
        endDate: '2023-01-31',
      },
    });

    const inputs = component.findAll('input[type="date"]');
    await inputs[0].setValue('2023-02-01');
    await inputs[0].trigger('change'); // Helper function calls emitDateChange on change

    expect(component.emitted('update:startDate')).toBeTruthy();
    expect(component.emitted('update:startDate')![0][0]).toBe('2023-02-01');
  });
});
