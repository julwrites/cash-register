import { defineEventHandler, getQuery } from 'h3';
import { getExpenseSummary } from '../../utils/expense-service';

export default defineEventHandler((event) => {
  const query = getQuery(event);

  const startDate = query.startDate as string;
  const endDate = query.endDate as string;
  const category = query.category as string;

  return getExpenseSummary({
    startDate,
    endDate,
    category,
  });
});
