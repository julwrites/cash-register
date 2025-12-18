import { updateRecurring, type RecurringExpense } from './recurring-db';

export default defineEventHandler(async (event) => {
  const id = parseInt(event.context.params?.id || '');
  if (isNaN(id)) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid ID' });
  }
  const body = await readBody(event);
  updateRecurring(id, body as Partial<RecurringExpense>);
  return { success: true };
});
