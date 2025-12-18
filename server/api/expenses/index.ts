import { defineEventHandler, getQuery } from 'h3';
import { fetchExpensesPaginated } from '../../utils/expense-service';

export default defineEventHandler((event) => {
  const query = getQuery(event);

  const page = query.page ? parseInt(query.page as string) : undefined;
  const limit = query.limit ? parseInt(query.limit as string) : undefined;
  const startDate = query.startDate as string;
  const endDate = query.endDate as string;
  const category = query.category as string;
  const sortBy = query.sortBy as string;
  const sortOrder = query.sortOrder as 'asc' | 'desc';

  return fetchExpensesPaginated({
    page,
    limit,
    startDate,
    endDate,
    category,
    sortBy,
    sortOrder,
  });
});
