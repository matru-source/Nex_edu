/**
 * Formats duration in seconds to a human-readable format
 * @param durationValue - Duration in seconds
 * @returns Formatted string like "1h 30m" or "45m" or "30s"
 * 
 * Note: This function expects duration in SECONDS.
 * - 1 minute = 60 seconds
 * - 1 hour = 3600 seconds
 */
export function formatDuration(durationValue: number): string {
  if (!durationValue || durationValue < 0) return "0s";

  // Ensure we're working with seconds
  let seconds = Math.floor(durationValue);

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  // For very short durations (under a minute), show seconds
  if (hours === 0 && minutes === 0) {
    return `${secs}s`;
  }

  // For durations under an hour, show minutes and optionally seconds
  if (hours === 0) {
    if (secs > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${minutes}m`;
  }

  // For longer durations, show hours and minutes (skip seconds for readability)
  if (minutes > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${hours}h`;
}

/**
 * Compact duration format for cards and tight spaces
 * @param durationValue - Duration in seconds
 * @returns Compact formatted string like "1:30:45" or "45:30" or "0:30"
 */
export function formatDurationCompact(durationValue: number): string {
  if (!durationValue || durationValue < 0) return "0:00";

  const seconds = Math.floor(durationValue);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }
  return `${minutes}:${String(secs).padStart(2, "0")}`;
}

/**
 * Formats duration in seconds to HH:MM:SS format
 * @param seconds - Duration in seconds
 * @returns Formatted string like "01:30:45" or "00:45:30"
 */
export function formatDurationHHMMSS(seconds: number): string {
  if (!seconds || seconds < 0) return "00:00:00";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}:${String(secs).padStart(2, "0")}`;
}
