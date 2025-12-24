<template>
  <div class="categories-container">
    <div class="table-container">
      <div class="desktop-view">
        <UTable :rows="categoriesByID" :columns="columns">
          <template #actions-data="{ row }">
            <UDropdown :items="actions(row)" :popper="{ strategy: 'fixed' }">
              <UButton
                color="gray"
                variant="ghost"
                icon="i-heroicons-ellipsis-horizontal-20-solid"
              />
            </UDropdown>
          </template>
        </UTable>
      </div>
      <div class="mobile-view">
        <div v-for="row in categoriesByID" :key="row.id" class="mobile-card">
          <div class="mobile-card-header">
            <span class="mobile-card-title">{{ row.name }}</span>
            <UDropdown :items="actions(row)" :popper="{ strategy: 'fixed' }">
              <UButton
                color="gray"
                variant="ghost"
                icon="i-heroicons-ellipsis-horizontal-20-solid"
              />
            </UDropdown>
          </div>
          <div class="mobile-card-meta">ID: {{ row.id }}</div>
        </div>
      </div>
    </div>

    <UModal v-model="isEditModalOpen">
      <UCard>
        <template #header>
          <h3 class="section-title modal-header-title">Edit Category</h3>
        </template>
        <UForm
          :state="editFormState"
          class="edit-form"
          @submit="handleUpdateCategory"
        >
          <UFormGroup label="Category Name" name="name">
            <UInput v-model="editFormState.name" />
          </UFormGroup>
          <div class="modal-actions">
            <UButton color="gray" variant="ghost" @click="isEditModalOpen = false">Cancel</UButton>
            <UButton type="submit" color="primary">Update</UButton>
          </div>
        </UForm>
      </UCard>
    </UModal>

    <div class="add-category-section">
      <h3 class="section-title">Add Category</h3>
      <UForm :state="newCategoryState" class="add-category-form" @submit="handleAddCategory">
        <UFormGroup label="Name" name="name" class="name-input-group">
          <UInput
            v-model="newCategoryState.name"
            placeholder="Enter new category name"
          />
        </UFormGroup>
        <UButton type="submit" color="primary" class="submit-button">Add Category</UButton>
      </UForm>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useCategories } from '@/composables/useCategories';
import { useToast } from '#imports';

const {
  categoriesByID,
  fetchCategories,
  addCategory,
  deleteCategory,
  updateCategory,
} = useCategories();
const toast = useToast();

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name' },
  { key: 'actions', label: 'Actions' },
];

const isEditModalOpen = ref(false);
const editFormState = ref<{ id: number | null; name: string }>({ id: null, name: '' });
const newCategoryState = ref({ name: '' });

onMounted(async () => {
  await fetchCategories();
});

function actions(row: { id: number; name: string }) {
  return [
    [
      {
        label: 'Edit',
        icon: 'i-heroicons-pencil-square-20-solid',
        click: () => startEditCategory(row),
      },
      {
        label: 'Delete',
        icon: 'i-heroicons-trash-20-solid',
        click: () => handleDeleteCategory(row.id),
      },
    ],
  ];
}

async function handleAddCategory() {
  const result = await addCategory(newCategoryState.value);
  if (result.success) {
    toast.add({ title: 'Category added successfully', color: 'green' });
    newCategoryState.value.name = '';
  } else {
    toast.add({
      title: 'Error adding category',
      description: result.error,
      color: 'red',
    });
  }
}

async function handleDeleteCategory(categoryId: number) {
  const result = await deleteCategory(categoryId);
  if (result.success) {
    toast.add({ title: 'Category deleted successfully', color: 'green' });
  } else {
    toast.add({
      title: 'Error deleting category',
      description: result.error,
      color: 'red',
    });
  }
}

async function handleUpdateCategory() {
  const result = await updateCategory(editFormState.value);
  if (result.success) {
    toast.add({ title: 'Category updated successfully', color: 'green' });
    isEditModalOpen.value = false;
  } else {
    toast.add({
      title: 'Error updating category',
      description: result.error,
      color: 'red',
    });
  }
}

function startEditCategory(category: { id: number; name: string }) {
  editFormState.value = { ...category };
  isEditModalOpen.value = true;
}
</script>

<style scoped>
.categories-container {
  max-width: 56rem; /* max-w-4xl */
  margin-left: auto;
  margin-right: auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem; /* space-y-6 */
}

.table-container {
  width: 100%;
}

.desktop-view {
  display: none;
}

@media (min-width: 768px) {
  .desktop-view {
    display: block;
    overflow-x: auto;
  }
}

.mobile-view {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

@media (min-width: 768px) {
  .mobile-view {
    display: none;
  }
}

.mobile-card {
  padding: 1rem;
  background-color: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
}

.mobile-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.mobile-card-title {
  font-weight: 600;
  color: var(--color-text-body);
}

.mobile-card-meta {
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.modal-header-title {
  margin-bottom: 0;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 1rem; /* space-y-4 */
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem; /* gap-2 */
}

.add-category-section {
  margin-top: 1.5rem; /* mt-6 */
  padding: 1rem; /* p-4 */
  border: 1px solid var(--color-border);
  border-radius: 0.5rem; /* rounded-lg */
}

.add-category-form {
  display: flex;
  flex-direction: column;
  gap: 1rem; /* gap-4 */
  align-items: flex-end;
}

@media (min-width: 640px) { /* sm: */
  .add-category-form {
    flex-direction: row;
  }
}

.name-input-group {
  flex: 1;
  width: 100%;
}

.submit-button {
  width: 100%;
}

@media (min-width: 640px) { /* sm: */
  .submit-button {
    width: auto;
  }
}
</style>
