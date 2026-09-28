const API_BASE_URL = 'http://localhost:5000/api/v1';

async function fetchJSON(url, options = {}) {
  try {
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || data.error || `HTTP error! status: ${res.status}`);
    }
    return data;
  } catch (err) {
    console.warn(`API call failed [${options.method || 'GET'} ${url}]:`, err.message);
    throw err;
  }
}

export const pmsApi = {
  // Module 1: Rooms Inventory
  async getRooms(filters = {}) {
    const params = new URLSearchParams();
    if (filters.status && filters.status !== 'All') params.append('status', filters.status);
    if (filters.floorNumber && filters.floorNumber !== 'All') params.append('floor_number', filters.floorNumber);
    if (filters.roomTypeId && filters.roomTypeId !== 'All') params.append('room_type_id', filters.roomTypeId);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    return fetchJSON(`${API_BASE_URL}/rooms${queryString}`);
  },

  async updateRoomStatus(roomId, status) {
    return fetchJSON(`${API_BASE_URL}/rooms/${roomId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  // Module 2: Reservations Engine
  async createReservation(bookingData) {
    return fetchJSON(`${API_BASE_URL}/reservations`, {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  },

  async getReservations(filters = {}) {
    const params = new URLSearchParams();
    if (filters.status && filters.status !== 'All') params.append('status', filters.status);
    if (filters.guestId) params.append('guest_id', filters.guestId);
    if (filters.roomId) params.append('room_id', filters.roomId);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    return fetchJSON(`${API_BASE_URL}/reservations${queryString}`);
  },

  // Module 3: Front Desk Operations
  async expressCheckIn(reservationId) {
    return fetchJSON(`${API_BASE_URL}/front-desk/${reservationId}/check-in`, {
      method: 'POST',
    });
  },

  async expressCheckOut(reservationId) {
    return fetchJSON(`${API_BASE_URL}/front-desk/${reservationId}/check-out`, {
      method: 'POST',
    });
  },

  // Module 4: Billing & Dynamic Ledger
  async postExtraCharge(reservationId, category, description, amount) {
    return fetchJSON(`${API_BASE_URL}/billing/charges`, {
      method: 'POST',
      body: JSON.stringify({ reservation_id: reservationId, category, description, amount }),
    });
  },

  async getInvoice(reservationId) {
    return fetchJSON(`${API_BASE_URL}/billing/invoices/${reservationId}`);
  },

  // Module 5: Cancellation Engine
  async cancelReservation(reservationId) {
    return fetchJSON(`${API_BASE_URL}/cancellation/${reservationId}/cancel`, {
      method: 'POST',
    });
  },

  // Module 6: Housekeeping Tracker
  async getHousekeepingTasks(status) {
    const queryString = status ? `?status=${status}` : '';
    return fetchJSON(`${API_BASE_URL}/housekeeping${queryString}`);
  },

  async completeHousekeepingTask(taskId) {
    return fetchJSON(`${API_BASE_URL}/housekeeping/${taskId}/complete`, {
      method: 'PATCH',
    });
  },

  // Health Check
  async checkHealth() {
    return fetchJSON(`${API_BASE_URL}/health`);
  }
};
