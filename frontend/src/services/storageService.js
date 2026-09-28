import {
  INITIAL_ROOMS,
  INITIAL_RESERVATIONS,
  INITIAL_BILLING_ITEMS,
  INITIAL_HOUSEKEEPING_TASKS,
  INITIAL_LOGS,
} from '../data/initialData';

const KEYS = {
  ROOMS: 'hotel_pms_rooms',
  RESERVATIONS: 'hotel_pms_reservations',
  BILLING: 'hotel_pms_billing',
  HOUSEKEEPING: 'hotel_pms_housekeeping',
  LOGS: 'hotel_pms_logs',
  USER_ROLE: 'hotel_pms_user_role',
};

export const storageService = {
  getRooms() {
    const data = localStorage.getItem(KEYS.ROOMS);
    return data ? JSON.parse(data) : INITIAL_ROOMS;
  },
  saveRooms(rooms) {
    localStorage.setItem(KEYS.ROOMS, JSON.stringify(rooms));
  },

  getReservations() {
    const data = localStorage.getItem(KEYS.RESERVATIONS);
    return data ? JSON.parse(data) : INITIAL_RESERVATIONS;
  },
  saveReservations(reservations) {
    localStorage.setItem(KEYS.RESERVATIONS, JSON.stringify(reservations));
  },

  getBillingItems() {
    const data = localStorage.getItem(KEYS.BILLING);
    return data ? JSON.parse(data) : INITIAL_BILLING_ITEMS;
  },
  saveBillingItems(items) {
    localStorage.setItem(KEYS.BILLING, JSON.stringify(items));
  },

  getHousekeepingTasks() {
    const data = localStorage.getItem(KEYS.HOUSEKEEPING);
    return data ? JSON.parse(data) : INITIAL_HOUSEKEEPING_TASKS;
  },
  saveHousekeepingTasks(tasks) {
    localStorage.setItem(KEYS.HOUSEKEEPING, JSON.stringify(tasks));
  },

  getLogs() {
    const data = localStorage.getItem(KEYS.LOGS);
    return data ? JSON.parse(data) : INITIAL_LOGS;
  },
  saveLogs(logs) {
    localStorage.setItem(KEYS.LOGS, JSON.stringify(logs));
  },

  getUserRole() {
    // Always start at portal selection — never restore a saved role
    return null;
  },
  saveUserRole(role) {
    // No-op: role is session-only, not persisted
  },

  resetAll() {
    localStorage.setItem(KEYS.ROOMS, JSON.stringify(INITIAL_ROOMS));
    localStorage.setItem(KEYS.RESERVATIONS, JSON.stringify(INITIAL_RESERVATIONS));
    localStorage.setItem(KEYS.BILLING, JSON.stringify(INITIAL_BILLING_ITEMS));
    localStorage.setItem(KEYS.HOUSEKEEPING, JSON.stringify(INITIAL_HOUSEKEEPING_TASKS));
    localStorage.setItem(KEYS.LOGS, JSON.stringify(INITIAL_LOGS));
    return {
      rooms: INITIAL_ROOMS,
      reservations: INITIAL_RESERVATIONS,
      billingItems: INITIAL_BILLING_ITEMS,
      housekeepingTasks: INITIAL_HOUSEKEEPING_TASKS,
      logs: INITIAL_LOGS,
      role: null,
    };
  }
};
