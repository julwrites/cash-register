<template>
  <div class="w-full">
    <UForm
      :state="expenseData"
      class="grid grid-cols-1 md:grid-cols-2 gap-6"
      @submit.prevent="handleSubmit"
    >
      <UFormGroup label="Date" name="date">
        <UInput id="date" v-model="expenseData.date" type="date" required class="w-full" />
      </UFormGroup>

      <UFormGroup label="Category" name="category">
        <USelectMenu
          id="category"
          v-model="expenseData.category"
          :options="categoryOptions"
          required
          class="w-full"
        />
      </UFormGroup>

      <UFormGroup label="Description" name="description" class="md:col-span-2">
        <USelectMenu
          id="description"
          :key="formKey"
          v-model="expenseData.description"
          :options="descriptionOptions"
          required
          creatable
          searchable
          class="w-full"
        />
      </UFormGroup>

      <UFormGroup label="Debit" name="debit">
        <UInput
          id="debit"
          v-model.number="expenseData.debit"
          type="number"
          step="0.01"
          min="0"
          class="w-full"
        />
      </UFormGroup>

      <UFormGroup label="Credit" name="credit">
        <UInput
          id="credit"
          v-model.number="expenseData.credit"
          type="number"
          step="0.01"
          min="0"
          class="w-full"
        />
      </UFormGroup>

      <div class="flex justify-end gap-4 md:col-span-2 mt-4">
        <UButton type="button" color="gray" variant="ghost" @click="cancelEdit">Cancel</UButton>
        <UButton type="submit" color="primary">{{
          props.submitButtonText
        }}</UButton>
      </div>
    </UForm>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { defaultExpense } from '../../composables/defaultExpense';
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
</script>
