import { describe, it, expect } from 'vitest';
import { setup, $fetch } from '@nuxt/test-utils';

describe('Categories API', async () => {
  await setup({});

  it('should fetch categories', async () => {
    // Seed data
    const { getDb } = await import('../../server/api/categories/categories-db');
    const db = getDb();
    db.prepare('DELETE FROM categories').run();
    db.prepare('INSERT INTO categories (name) VALUES (?)').run('Test Category');

    const categories = await $fetch('/api/categories');
    expect(categories).toBeDefined();
    expect(Array.isArray(categories)).toBe(true);
    const category = (categories as any[]).find(
      (c: any) => c.name === 'Test Category'
    );
    expect(category).toBeDefined();
  });

  it('should create a category', async () => {
    const newCategory = { name: 'New Category' };
    const created: any = await $fetch('/api/categories', {
      method: 'POST',
      body: newCategory,
    });
    expect(created).toBeDefined();
    expect(created.name).toBe('New Category');
    expect(created.id).toBeDefined();
  });
});
