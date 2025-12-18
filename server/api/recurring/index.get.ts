import { getAllRecurring } from './recurring-db';

export default defineEventHandler((_event) => {
  return getAllRecurring();
});
