/**
 * roomValidation.js
 * ─────────────────
 * Core business logic for validating room availability before a new booking.
 * Blocks rooms that are:
 *   1. Occupied (status === 'Occupied')
 *   2. Under Maintenance (status === 'Maintenance')
 *   3. Already booked for overlapping dates in another reservation
 */

/**
 * Returns true if two date ranges overlap.
 * Uses inclusive check-in / exclusive check-out convention.
 * @param {string} aIn  - ISO date string
 * @param {string} aOut - ISO date string
 * @param {string} bIn  - ISO date string
 * @param {string} bOut - ISO date string
 */
function datesOverlap(aIn, aOut, bIn, bOut) {
  // Overlap exists when A starts before B ends AND A ends after B starts
  return aIn < bOut && aOut > bIn;
}

/**
 * Evaluate availability of a single room for the requested dates.
 *
 * @param {Object}   room         - Room object from state
 * @param {string}   checkIn      - Requested check-in  (YYYY-MM-DD)
 * @param {string}   checkOut     - Requested check-out (YYYY-MM-DD)
 * @param {Object[]} reservations - Full reservations array from state
 * @param {string}   [excludeResId] - Reservation ID to exclude (for edits)
 *
 * @returns {{ available: boolean, reason: string }}
 */
export function checkRoomAvailability(room, checkIn, checkOut, reservations, excludeResId = null) {
  // 1. Physically unavailable statuses
  if (room.status === 'Occupied') {
    return { available: false, reason: 'Occupied' };
  }
  if (room.status === 'Maintenance') {
    return { available: false, reason: 'Under Maintenance' };
  }

  // 2. Overlapping confirmed / checked-in bookings
  if (!checkIn || !checkOut || checkIn >= checkOut) {
    // If dates are invalid we can't validate — treat as unavailable to be safe
    return { available: false, reason: 'Invalid dates' };
  }

  const hasConflict = reservations.some(res => {
    if (res.id === excludeResId) return false;
    if (res.roomId !== room.id && res.roomNumber !== room.number) return false;
    if (!['Confirmed', 'Checked-In'].includes(res.status)) return false;
    return datesOverlap(checkIn, checkOut, res.checkIn, res.checkOut);
  });

  if (hasConflict) {
    return { available: false, reason: 'Already booked for those dates' };
  }

  return { available: true, reason: '' };
}
