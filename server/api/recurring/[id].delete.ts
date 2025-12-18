import { deleteRecurring } from './recurring-db';

export default defineEventHandler(async (event) => {
  const id = parseInt(event.context.params?.id || '');
  if (isNaN(id)) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid ID' });
  }
  deleteRecurring(id);
  return { success: true };
});
