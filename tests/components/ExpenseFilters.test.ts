import { describe, it, expect } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import ExpenseFilters from '../../components/ExpenseFilters.vue';

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

    // There are now two reset buttons (desktop and mobile)
    // We can trigger either one
    const buttons = component.findAll('button');
    const resetButton = buttons.find(b => b.text().includes('Reset Filters'));

    if (resetButton) {
        await resetButton.trigger('click');
        expect(component.emitted('reset-filters')).toBeTruthy();
    } else {
        throw new Error('Reset button not found');
    }
  });

  it('shows date inputs when custom period is selected', async () => {
    const component = await mountSuspended(ExpenseFilters, {
      props: {
        ...defaultProps,
        selectedPeriod: { label: 'Custom Range', value: 'custom' },
      },
    });

    expect(component.find('.date-range-picker').exists()).toBe(true);
    // We now have duplicate inputs for mobile/desktop, so we expect 4
    expect(component.findAll('input[type="date"]').length).toBe(4);
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
    // Trigger on the first one (Desktop Start Date)
    await inputs[0].setValue('2023-02-01');
    await inputs[0].trigger('change');

    expect(component.emitted('update:startDate')).toBeTruthy();
    expect(component.emitted('update:startDate')![0][0]).toBe('2023-02-01');
  });
});
