/**
 * Event Logging Helper
 * Ensures userId + recordingId are logged for every event
 */

const { prisma } = require('./db');

/**
 * Log a recording event with userId and recordingId
 * @param {string} recordingId - Recording ID
 * @param {string} userId - User ID
 * @param {string} event - Event name (e.g., 'created', 'profile_attached', 'transcribed')
 * @param {object} metadata - Additional event data
 */
async function logRecordingEvent(recordingId, userId, event, metadata = {}) {
  try {
    await prisma.recordingEventLog.create({
      data: {
        recordingId,
        userId,
        event,
        metadata,
      },
    });

    console.log(`[EVENT] userId=${userId} recordingId=${recordingId} event=${event}`, metadata);
  } catch (error) {
    console.error(`Failed to log event: ${event}`, error);
    // Don't throw - logging failures shouldn't break the main operation
  }
}

module.exports = { logRecordingEvent };
