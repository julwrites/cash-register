<template>
  <div class="categories-container">
    <h2 class="page-title">Manage Categories</h2>
    
    <div class="categories-table">
      <UTable :rows="categoriesByID" :columns="columns">
        <template #actions-data="{ row }">
          <UDropdown :items="actions(row)">
            <UButton color="gray" variant="ghost" icon="i-heroicons-ellipsis-horizontal-20-solid" />
          </UDropdown>
        </template>
      </UTable>
    </div>

    <UModal v-model="isEditModalOpen">
      <div class="edit-modal">
        <h3 class="modal-title">Edit Category</h3>
        <UForm :state="editFormState" @submit="handleUpdateCategory" class="edit-form">
          <UFormGroup label="Category Name" name="name">
            <UInput v-model="editFormState.name" />
          </UFormGroup>
          <div class="modal-actions">
            <UButton color="gray" @click="isEditModalOpen = false">Cancel</UButton>
            <UButton type="submit" color="primary">Update</UButton>
          </div>
        </UForm>
      </div>
    </UModal>

    <div class="new-category-form">
      <UForm :state="newCategoryState" @submit="handleAddCategory">
        <UFormGroup label="New Category" name="name">
          <UInput v-model="newCategoryState.name" placeholder="Enter new category name" />
        </UFormGroup>
        <UButton type="submit" color="primary" class="add-button">Add Category</UButton>
      </UForm>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useCategories } from '@/composables/useCategories';
import { useToast } from '#imports';

const { categoriesByID, fetchCategories, addCategory, deleteCategory, updateCategory } = useCategories();
const toast = useToast();

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name' },
  { key: 'actions', label: 'Actions' },
];

const isEditModalOpen = ref(false);
const editFormState = ref({ id: null, name: '' });
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
    toast.add({ title: 'Error adding category', description: result.error, color: 'red' });
  }
}

async function handleDeleteCategory(categoryId: number) {
  const result = await deleteCategory(categoryId);
  if (result.success) {
    toast.add({ title: 'Category deleted successfully', color: 'green' });
  } else {
    toast.add({ title: 'Error deleting category', description: result.error, color: 'red' });
  }
}

async function handleUpdateCategory() {
  const result = await updateCategory(editFormState.value);
  if (result.success) {
    toast.add({ title: 'Category updated successfully', color: 'green' });
    isEditModalOpen.value = false;
  } else {
    toast.add({ title: 'Error updating category', description: result.error, color: 'red' });
  }
}

function startEditCategory(category: { id: number; name: string }) {
  editFormState.value = { ...category };
  isEditModalOpen.value = true;
}
</script>

<style scoped>
.categories-container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.page-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
}

.categories-table {
  margin-bottom: 20px;
  overflow-x: auto;
}

.modal-title {
  font-size: 18px;
  font-weight: semibold;
  margin-bottom: 15px;
}

.edit-modal {
  padding: 20px;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.new-category-form {
  margin-top: 20px;
}

:deep(.form-group) {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 15px;
}

:deep(.form-group label) {
  font-weight: bold;
}

:deep(.form-group input) {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.add-button {
  align-self: flex-start;
}
</style>