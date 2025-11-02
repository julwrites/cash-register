import { defineEventHandler } from 'h3';
import { getMigrationSchedule } from '../settings/settings-db';

export default defineEventHandler(async (event) => {
  try {
    const schedule = await getMigrationSchedule();
    return schedule;
  } catch (error) {
    console.error('Error fetching migration schedule:', error);
    return {
      enabled: true,
      time: '00:00',
      frequency: 'daily'
    };
  }
});
