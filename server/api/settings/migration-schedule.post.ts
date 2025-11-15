import { defineEventHandler, readBody, createError } from 'h3';
import { setMigrationSchedule, MigrationSchedule } from '../settings/settings-db';
import { rescheduleScheduler } from '../../../scheduler';

export default defineEventHandler(async (event) => {
  try {
    const schedule: MigrationSchedule = await readBody(event);

    if (!schedule.time || !schedule.frequency) {
      return createError({
        statusCode: 400,
        statusMessage: 'Missing required fields: time and frequency',
      });
    }

    if (!['daily', 'weekly', 'monthly'].includes(schedule.frequency)) {
      return createError({
        statusCode: 400,
        statusMessage: 'Invalid frequency. Must be daily, weekly, or monthly',
      });
    }

    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(schedule.time)) {
      return createError({
        statusCode: 400,
        statusMessage: 'Invalid time format. Use HH:MM (24-hour format)',
      });
    }

    await setMigrationSchedule(schedule);

    // Reschedule the task immediately
    await rescheduleScheduler();

    return {
      success: true,
      message: 'Migration schedule updated and applied immediately.',
      schedule
    };
  } catch (error) {
    console.error('Error updating migration schedule:', error);
    return createError({
      statusCode: 500,
      statusMessage: 'Failed to update migration schedule',
    });
  }
});
