<template>
  <div class="form-container">
    <UForm
      :state="expenseData"
      class="form-grid"
      @submit.prevent="handleSubmit"
    >
      <UFormGroup label="Date" name="date">
        <UInput
          id="date"
          v-model="expenseData.date"
          type="date"
          required
          color="gray"
          :ui="{ base: 'w-full' }"
        />
      </UFormGroup>

      <UFormGroup label="Category" name="category">
        <USelectMenu
          id="category"
          v-model="expenseData.category"
          :options="categoryOptions"
          required
          color="gray"
          :ui="{ base: 'w-full' }"
          @open="handleDropdownOpen"
          @close="handleDropdownClose"
        />
      </UFormGroup>

      <UFormGroup label="Description" name="description" class="full-width-field">
        <USelectMenu
          id="description"
          :key="formKey"
          v-model="expenseData.description"
          :options="descriptionOptions"
          required
          creatable
          searchable
          color="gray"
          :ui="{ base: 'w-full' }"
          @open="handleDropdownOpen"
          @close="handleDropdownClose"
        />
      </UFormGroup>

      <UFormGroup label="Debit" name="debit">
        <UInput
          id="debit"
          v-model.number="expenseData.debit"
          type="number"
          step="0.01"
          min="0"
          color="gray"
          :ui="{ base: 'w-full' }"
        />
      </UFormGroup>

      <UFormGroup label="Credit" name="credit">
        <UInput
          id="credit"
          v-model.number="expenseData.credit"
          type="number"
          step="0.01"
          min="0"
          color="gray"
          :ui="{ base: 'w-full' }"
        />
      </UFormGroup>

      <div class="form-actions">
        <UButton type="button" color="gray" variant="ghost" @click="cancelEdit">Cancel</UButton>
        <UButton type="submit" color="primary">{{
          props.submitButtonText
        }}</UButton>
      </div>
    </UForm>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, onUnmounted } from 'vue';
import { defaultExpense } from '@/composables/defaultExpense';
import { useCategories } from '@/composables/useCategories';

const { categoriesByID, fetchCategories } = useCategories();

const props = defineProps<{
  expense: Expense;
  submitButtonText: string;
}>();

const emits = defineEmits<{
  (event: 'submit', expense: Expense): void;
  (event: 'cancel'): void;
}>();

const expenseData = ref<Expense>({
  ...defaultExpense,
  ...props.expense,
});

const formKey = ref(0);
const descriptionList = ref<{ label: string; category: string }[]>([]);
const descriptionOptions = computed(() =>
  descriptionList.value.map((d) => d.label)
);
const toast = useToast();

watch(
  () => props.expense,
  (newVal) => {
    expenseData.value = { ...defaultExpense, ...newVal };
  }
);

const categoryOptions = computed(() => [
  ...categoriesByID.value.map((cat) => cat.name),
]);

const fetchDescriptions = async () => {
  const response = await fetch('/api/descriptions');
  if (response.ok) {
    descriptionList.value = await response.json();
  }
};

watch(
  () => expenseData.value.description,
  (newDesc) => {
    if (!newDesc) return;
    const match = descriptionList.value.find((d) => d.label === newDesc);
    if (match && match.category) {
      expenseData.value.category = match.category;
    }
  }
);

onMounted(async () => {
  await fetchCategories();
  await fetchDescriptions();
});

onUnmounted(() => {
  // Clean up any leftover dropdown open state
  document.body.classList.remove('dropdown-open');
});

async function handleSubmit() {
  if (validateExpense(expenseData.value)) {
    emits('submit', expenseData.value);
    await fetchDescriptions();
  }
  expenseData.value = { ...defaultExpense };
  formKey.value++;
}

function validateExpense(expense: Expense): boolean {
  if (!expense.date || !expense.category || !expense.description) {
    toast.add({
      title: 'Validation Error',
      description: 'Please fill in all fields',
      color: 'red',
    });
    return false;
  }

  if (expense.credit === 0 && expense.debit === 0) {
    toast.add({
      title: 'Validation Error',
      description: 'You must enter a credit or debit amount',
      color: 'red',
    });
    return false;
  }

  return true;
}

function cancelEdit() {
  expenseData.value = { ...defaultExpense }; // Reset form
  emits('cancel');
}

function handleDropdownOpen() {
  // Add class to body to prevent scrolling when dropdown is open on mobile
  if (window.innerWidth <= 768) {
    document.body.classList.add('dropdown-open');
  }
}

function handleDropdownClose() {
  // Remove class from body when dropdown closes
  document.body.classList.remove('dropdown-open');
}
</script>

<style scoped>
.form-container {
  width: 100%;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

/* .form-input class removed - using :ui="{ base: 'w-full' }" instead */

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

@media (min-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr 1fr;
  }

  .full-width-field {
    grid-column: span 2;
  }

  .form-actions {
    grid-column: span 2;
  }
}
</style>
