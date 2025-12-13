// /Users/julianteh/julwrites/cash-register/server/api/expenses/descriptions.ts

import { defineEventHandler } from 'h3';
import { getDb } from './expenses-db';
import * as fs from 'fs';
import * as path from 'path';

const dataDir = process.env.DATA_DIR || path.join(process.cwd(), 'data');

const getYears = () => {
  const files = fs.readdirSync(dataDir);
  return files
    .filter((file) => file.startsWith('expenses-') && file.endsWith('.sqlite'))
    .map((file) =>
      parseInt(file.replace('expenses-', '').replace('.sqlite', ''))
    );
};

export default defineEventHandler(async (_event) => {
  const years = getYears();
  let allDescriptions: string[] = [];
  for (const year of years) {
    const db = await getDb(year);
    const descriptions = await db.all(
      "SELECT DISTINCT description FROM expenses WHERE description IS NOT NULL AND description != ''"
    );
    allDescriptions = allDescriptions.concat(
      descriptions.map((d: any) => d.description)
    );
  }
  // Return unique descriptions
  return [...new Set(allDescriptions)];
});
