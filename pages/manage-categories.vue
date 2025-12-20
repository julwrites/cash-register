<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <div class="overflow-x-auto">
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
          <h3 class="text-lg font-bold">Edit Category</h3>
        </template>
        <UForm
          :state="editFormState"
          class="space-y-4"
          @submit="handleUpdateCategory"
        >
          <UFormGroup label="Category Name" name="name">
            <UInput v-model="editFormState.name" />
          </UFormGroup>
          <div class="flex justify-end gap-2">
            <UButton color="gray" variant="ghost" @click="isEditModalOpen = false">Cancel</UButton>
            <UButton type="submit" color="primary">Update</UButton>
          </div>
        </UForm>
      </UCard>
    </UModal>

    <div class="mt-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
      <h3 class="text-lg font-semibold mb-4">Add Category</h3>
      <UForm :state="newCategoryState" class="flex flex-col sm:flex-row gap-4 items-end" @submit="handleAddCategory">
        <UFormGroup label="Name" name="name" class="flex-1 w-full">
          <UInput
            v-model="newCategoryState.name"
            placeholder="Enter new category name"
          />
        </UFormGroup>
        <UButton type="submit" color="primary" class="w-full sm:w-auto">Add Category</UButton>
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
