import { addRecurring, type RecurringExpense } from './recurring-db';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  return addRecurring(body as RecurringExpense);
});
