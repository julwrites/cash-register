import { processRecurringExpenses } from './recurring-db';

export default defineEventHandler(async (_event) => {
  const count = processRecurringExpenses();
  return { processed: count };
});
