import { defineEventHandler } from 'h3';
import { getDescriptionDb } from './descriptions-db';

export default defineEventHandler(async (event) => {
  try {
    const db = await getDescriptionDb();
    const descriptions = await db.all(`
      SELECT description
      FROM description_usage
      ORDER BY last_used DESC, usage_count DESC
      LIMIT 1000
    `);

    console.log(`Returning ${descriptions.length} MRU-sorted descriptions`);
    return descriptions.map((d) => d.description);
  } catch (error) {
    console.error('Error fetching MRU descriptions:', error);
    // Return empty array as fallback
    return [];
  }
});
