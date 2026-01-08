import { describe, it, expect, vi } from 'vitest';
import { mountSuspended, mockComponent } from '@nuxt/test-utils/runtime';
import ExpenseList from '../../pages/expense-list.vue';
import { ref } from 'vue';
import { useExpenses } from '../../composables/useExpenses';
import { useCategories } from '../../composables/useCategories';

// Mock dependencies
vi.mock('../../composables/useExpenses');
vi.mock('../../composables/useCategories');

mockComponent('UPagination', {
    props: ['modelValue', 'total', 'perPage'],
    emits: ['update:modelValue'],
    template: `
        <div class="mock-pagination">
            <button class="page-2-btn" @click="$emit('update:modelValue', 2)">Go to Page 2</button>
        </div>
    `
});

mockComponent('ExpenseFilters', { template: '<div></div>' });
mockComponent('ExpenseTable', { template: '<div></div>', props: ['entries', 'loading', 'columns'] });
mockComponent('SummaryCards', { template: '<div></div>' });
mockComponent('EditExpenseModal', { template: '<div></div>' });
mockComponent('UButtonGroup', { template: '<div class="btn-group"><slot /></div>' });
mockComponent('UButton', {
    props: ['label', 'color'],
    template: '<button :class="label" @click="$emit(\'click\')">{{ label }}</button>'
});
mockComponent('UModal', { template: '<div><slot /></div>' });

describe('ExpenseList Pagination', () => {
    it('calls fetchPaginatedExpenses when pagination changes', async () => {
        const fetchSpy = vi.fn().mockResolvedValue({});
        const paginatedExpenses = ref([]);
        const totalCount = ref(50);
        const loading = ref(false);

        vi.mocked(useExpenses).mockReturnValue({
            paginatedExpenses,
            totalCount,
            loading,
            fetchPaginatedExpenses: fetchSpy,
            fetchExpenseSummary: vi.fn().mockResolvedValue({}),
            expenseSummary: ref({ income: 0, expenses: 0 }),
            updateExpense: vi.fn(),
            deleteExpense: vi.fn(),
            expenses: ref([]),
            entries: ref([])
        } as any);

        vi.mocked(useCategories).mockReturnValue({
            categoriesByName: ref([]),
            fetchCategories: vi.fn().mockResolvedValue([])
        } as any);

        const component = await mountSuspended(ExpenseList);

        // 1. Switch to 'All' view mode to show pagination
        const allButton = component.find('button.All'); 
        expect(allButton.exists()).toBe(true);
        await allButton.trigger('click');

        // 2. Find Pagination
        const pagination = component.find('.mock-pagination');
        expect(pagination.exists()).toBe(true);

        // 3. Trigger Page Change
        await pagination.find('.page-2-btn').trigger('click');

        // 4. Assert
        expect(fetchSpy).toHaveBeenCalledWith(expect.objectContaining({ page: 2 }));
    });
});
