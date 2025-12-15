import { describe, it, expect } from 'vitest';
import { mountSuspended, mockComponent } from '@nuxt/test-utils/runtime';
import ExpenseTable from '../../pages/components/ExpenseTable.vue';

// Mock UDropdown to expose items and trigger clicks
mockComponent('UDropdown', {
  props: ['items'],
  template: `
        <div class="mock-dropdown">
            <div v-for="(group, gIndex) in items" :key="gIndex">
                <button
                    v-for="(item, iIndex) in group"
                    :key="iIndex"
                    :class="'item-' + item.label"
                    @click="item.click"
                >
                    {{ item.label }}
                </button>
            </div>
        </div>
    `,
});

describe('ExpenseTable', () => {
  const columns = [
    { key: 'date', label: 'Date' },
    { key: 'category', label: 'Category' },
    { key: 'description', label: 'Description' },
    { key: 'amount', label: 'Amount' },
    { key: 'actions', label: '' },
  ];

  const entries = [
    {
      id: 1,
      date: '2023-01-01',
      category: 'Food',
      description: 'Lunch',
      amount: 10,
    },
    {
      id: 2,
      date: '2023-01-02',
      category: 'Transport',
      description: 'Bus',
      amount: 5,
    },
  ];

  it('renders rows correctly', async () => {
    const component = await mountSuspended(ExpenseTable, {
      props: {
        columns,
        entries,
      },
    });

    expect(component.text()).toContain('Lunch');
    expect(component.text()).toContain('Bus');
    expect(component.text()).toContain('Food');
  });

  it('emits events when actions are triggered', async () => {
    const component = await mountSuspended(ExpenseTable, {
      props: {
        columns,
        entries,
      },
    });

    // Find our mock dropdowns
    const mockDropdowns = component.findAll('.mock-dropdown');
    expect(mockDropdowns.length).toBeGreaterThan(0);

    // First row actions
    const firstDropdown = mockDropdowns[0];

    // Find Edit button
    const editBtn = firstDropdown.find('.item-Edit');
    expect(editBtn.exists()).toBe(true);

    await editBtn.trigger('click');

    expect(component.emitted('edit')).toBeTruthy();
    expect(component.emitted('edit')![0][0]).toMatchObject(entries[0]);

    // Find Delete button
    const deleteBtn = firstDropdown.find('.item-Delete');
    expect(deleteBtn.exists()).toBe(true);

    await deleteBtn.trigger('click');

    expect(component.emitted('delete')).toBeTruthy();
    expect(component.emitted('delete')![0][0]).toBe(entries[0].id);
  });
});
