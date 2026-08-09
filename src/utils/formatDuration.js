'use strict';

/**
 * Convert total seconds to "m:ss" format.
 * @param {number} secs
 * @returns {string}
 */
function formatDuration(secs) {
  const m = Math.floor(secs / 60);
  const s = String(Math.floor(secs % 60)).padStart(2, '0');
  return `${m}:${s}`;
}

module.exports = { formatDuration };
