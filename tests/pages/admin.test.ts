import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import AdminPage from '../../pages/admin.vue';

// Mock global fetch
const globalFetch = vi.fn();
global.fetch = globalFetch;

describe('AdminPage', () => {
  beforeEach(() => {
    globalFetch.mockReset();
  });

  it('renders pending users and shows Approve action', async () => {
     const mockUsers = [
      { id: 1, username: 'pending_user', is_admin: false, is_approved: false },
    ];

    globalFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUsers
    });

    const component = await mountSuspended(AdminPage);

    // Allow promises to resolve
    await new Promise(resolve => setTimeout(resolve, 0));

    const vm = component.vm as any;

    // Check computed rows
    expect(vm.rows).toHaveLength(1);
    expect(vm.rows[0].status).toBe('Pending');
    expect(vm.rows[0].name).toBe('pending_user');

    // Check actions
    const actions = vm.actions(vm.rows[0]);
    // actions returns [[ { label: 'Approve' ... }, { label: 'Remove' ... } ]]
    // Wait, the code says:
    // if pending: push Approve. push Remove. return [items]
    // so it is [ [Approve, Remove] ] ?? No.
    // items is array. return [items]. So yes.

    const flatActions = actions[0];
    const labels = flatActions.map((a: any) => a.label);
    expect(labels).toContain('Approve');
    expect(labels).toContain('Remove');
    expect(labels).not.toContain('Promote');
    expect(labels).not.toContain('Demote');
  });

  it('approveUser updates state', async () => {
      const mockUsers = [
      { id: 1, username: 'pending_user', is_admin: false, is_approved: false },
    ];

    globalFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUsers
    });

    const component = await mountSuspended(AdminPage);
     await new Promise(resolve => setTimeout(resolve, 0));
     const vm = component.vm as any;

     // Mock approve API response
     globalFetch.mockResolvedValueOnce({
         ok: true,
         json: async () => ({ id: 1, username: 'pending_user', is_admin: false, is_approved: true })
     });

     // Find the approve action
     const actions = vm.actions(vm.rows[0]);
     const approveAction = actions[0].find((a: any) => a.label === 'Approve');

     await approveAction.click();

     expect(globalFetch).toHaveBeenCalledWith('/api/users/admin/approveUser', expect.objectContaining({
         method: 'POST',
         body: JSON.stringify({ userId: 1 })
     }));

     // Check state update
     expect(vm.users[0].is_approved).toBe(true);
     expect(vm.rows[0].status).toBe('Activated');
  });
});
