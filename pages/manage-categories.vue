<template>
  <div class="categories-container">
    <div class="table-container">
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

    <UModal v-model="isEditModalOpen">
      <UCard>
        <template #header>
          <h3 class="modal-title">Edit Category</h3>
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
  overflow-x: auto;
}

.modal-title {
  font-size: 1.125rem; /* text-lg */
  font-weight: 700; /* font-bold */
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
  border: 1px solid #e5e7eb; /* border-gray-200 */
  border-radius: 0.5rem; /* rounded-lg */
}

:global(.dark) .add-category-section {
  border-color: #374151; /* dark:border-gray-700 */
}

.section-title {
  font-size: 1.125rem; /* text-lg */
  font-weight: 600; /* font-semibold */
  margin-bottom: 1rem; /* mb-4 */
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
