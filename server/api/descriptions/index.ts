import { defineEventHandler } from 'h3';
import { getDescriptionDb } from './descriptions-db';

export default defineEventHandler((_event) => {
  try {
    const db = getDescriptionDb();
    const descriptions = db
      .prepare(
        `
      SELECT description, last_category
      FROM description_usage
      ORDER BY last_used DESC, usage_count DESC
      LIMIT 1000
    `
      )
      .all() as any[];

    console.log(`Returning ${descriptions.length} MRU-sorted descriptions`);
    return descriptions.map((d) => ({
      label: d.description,
      category: d.last_category,
    }));
  } catch (error) {
    console.error('Error fetching MRU descriptions:', error);
    // Return empty array as fallback
    return [];
  }
});
