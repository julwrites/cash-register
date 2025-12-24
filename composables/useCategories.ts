import { computed, ref } from 'vue';

export function useCategories() {
  const categories = ref<{ id: number; name: string }[]>([]);
  const categoriesByID = computed(() =>
    categories.value.slice().sort((a, b) => a.id - b.id)
  );
  const categoriesByName = computed(() =>
    categories.value.slice().sort((a, b) => a.name.localeCompare(b.name))
  );

  async function fetchCategories() {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        categories.value = await response.json();
      } else {
        console.error('Failed to fetch categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }

  async function addCategory(newCategory: { name: string }) {
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCategory),
      });

      if (response.ok) {
        await fetchCategories();
        return { success: true };
      } else {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.statusMessage || 'Failed to add category',
        };
      }
    } catch (error) {
      console.error('Failed to add category:', error);
      return { success: false, error: error.message };
    }
  }

  async function deleteCategory(categoryId: number) {
    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchCategories();
        return { success: true };
      } else {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.statusMessage || 'Failed to delete category',
        };
      }
    } catch (error) {
      console.error('Failed to delete category:', error);
      return { success: false, error: error.message };
    }
  }

  async function updateCategory(category: { id: number; name: string }) {
    try {
      const response = await fetch(`/api/categories/${category.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: category.name }),
      });

      if (response.ok) {
        await fetchCategories();
        return { success: true };
      } else {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.statusMessage || 'Failed to update category',
        };
      }
    } catch (error) {
      console.error('Failed to update category:', error);
      return { success: false, error: error.message };
    }
  }

  return {
    categoriesByID,
    categoriesByName,
    fetchCategories,
    addCategory,
    deleteCategory,
    updateCategory,
  };
}
