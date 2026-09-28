export const INITIAL_ROOMS = [
  { id: '101', number: '101', floor: '1st Floor', category: 'Standard', rate: 120, status: 'Available', maxOccupancy: 2, amenities: ['WiFi', 'TV', 'Air Conditioner', 'Coffee Maker'] },
  { id: '102', number: '102', floor: '1st Floor', category: 'Standard', rate: 120, status: 'Occupied', maxOccupancy: 2, amenities: ['WiFi', 'TV', 'Air Conditioner'] },
  { id: '103', number: '103', floor: '1st Floor', category: 'Deluxe', rate: 180, status: 'Needs Cleaning', maxOccupancy: 3, amenities: ['WiFi', '4K TV', 'Mini Bar', 'Ocean View'] },
  { id: '104', number: '104', floor: '1st Floor', category: 'Deluxe', rate: 180, status: 'Available', maxOccupancy: 3, amenities: ['WiFi', '4K TV', 'Mini Bar', 'Balcony'] },
  { id: '201', number: '201', floor: '2nd Floor', category: 'Executive', rate: 250, status: 'Occupied', maxOccupancy: 4, amenities: ['WiFi', 'Workstation', 'Espresso Machine', 'Lounge Access'] },
  { id: '202', number: '202', floor: '2nd Floor', category: 'Executive', rate: 250, status: 'Maintenance', maxOccupancy: 4, amenities: ['WiFi', 'Workstation', 'Jacuzzi'], maintenanceNote: 'AC compressor replacement' },
  { id: '203', number: '203', floor: '2nd Floor', category: 'Suite', rate: 450, status: 'Occupied', maxOccupancy: 4, amenities: ['WiFi', 'Master Suite', 'Private Jacuzzi', 'Butler Service', 'Panaroma View'] },
  { id: '301', number: '301', floor: 'Penthouse', category: 'Presidential Suite', rate: 850, status: 'Needs Cleaning', maxOccupancy: 6, amenities: ['Private Pool', 'Helipad Access', 'Chef Kitchen', 'Panoramic Deck'] },
];

export const INITIAL_GUESTS = [
  { id: 'g1', name: 'Eleanor Vance', email: 'eleanor@vance.com', phone: '+1 555-0192', idDocument: 'PASSPORT-8821' },
  { id: 'g2', name: 'Marcus Sterling', email: 'marcus@sterling.org', phone: '+1 555-0341', idDocument: 'DL-9941' },
  { id: 'g3', name: 'Sophia Chen', email: 'sophia.chen@tech.co', phone: '+1 555-0812', idDocument: 'PASSPORT-1102' },
];

export const INITIAL_RESERVATIONS = [
  {
    id: 'res-1001',
    guestId: 'g1',
    guestName: 'Eleanor Vance',
    guestEmail: 'eleanor@vance.com',
    guestPhone: '+1 555-0192',
    roomId: '102',
    roomNumber: '102',
    category: 'Standard',
    checkIn: '2026-09-27',
    checkOut: '2026-09-30',
    nights: 3,
    nightlyRate: 120,
    status: 'Checked-In',
    paymentStatus: 'Paid',
    specialRequests: 'High floor away from elevator',
    createdAt: '2026-09-20T10:00:00Z',
  },
  {
    id: 'res-1002',
    guestId: 'g2',
    guestName: 'Marcus Sterling',
    guestEmail: 'marcus@sterling.org',
    guestPhone: '+1 555-0341',
    roomId: '201',
    roomNumber: '201',
    category: 'Executive',
    checkIn: '2026-09-28',
    checkOut: '2026-10-02',
    nights: 4,
    nightlyRate: 250,
    status: 'Checked-In',
    paymentStatus: 'Pending',
    specialRequests: 'Late check-in expected around 8 PM',
    createdAt: '2026-09-22T14:30:00Z',
  },
  {
    id: 'res-1003',
    guestId: 'g3',
    guestName: 'Sophia Chen',
    guestEmail: 'sophia.chen@tech.co',
    guestPhone: '+1 555-0812',
    roomId: '203',
    roomNumber: '203',
    category: 'Suite',
    checkIn: '2026-09-28',
    checkOut: '2026-10-01',
    nights: 3,
    nightlyRate: 450,
    status: 'Confirmed',
    paymentStatus: 'Paid',
    specialRequests: 'Champagne bottle on arrival',
    createdAt: '2026-09-25T09:15:00Z',
  },
];

export const INITIAL_BILLING_ITEMS = [
  { id: 'b1', reservationId: 'res-1001', roomNumber: '102', description: 'Gourmet Breakfast Service', category: 'Room Service', amount: 45.0, timestamp: '2026-09-28T08:30:00Z' },
  { id: 'b2', reservationId: 'res-1001', roomNumber: '102', description: 'Premium Wine & Snack Box', category: 'Minibar', amount: 65.0, timestamp: '2026-09-27T21:00:00Z' },
  { id: 'b3', reservationId: 'res-1002', roomNumber: '201', description: 'Deep Tissue Massage (60 min)', category: 'Spa', amount: 140.0, timestamp: '2026-09-28T11:00:00Z' },
  { id: 'b4', reservationId: 'res-1002', roomNumber: '201', description: 'Express Dry Cleaning', category: 'Laundry', amount: 35.0, timestamp: '2026-09-28T09:15:00Z' },
];

export const INITIAL_HOUSEKEEPING_TASKS = [
  { id: 'hk-1', roomNumber: '103', floor: '1st Floor', category: 'Deluxe', priority: 'High', type: 'Turn-Down', status: 'Pending', assignedTo: 'Maria Santos', note: 'Guest checked out at 10:00 AM' },
  { id: 'hk-2', roomNumber: '301', floor: 'Penthouse', category: 'Presidential Suite', priority: 'Urgent', type: 'Deep Clean', status: 'Pending', assignedTo: 'Carlos Ruiz', note: 'VIP Guest arriving at 3:00 PM' },
  { id: 'hk-3', roomNumber: '202', floor: '2nd Floor', category: 'Executive', priority: 'Medium', type: 'Maintenance Lock', status: 'In Progress', assignedTo: 'Dave Tech', note: 'AC Unit leakage report' },
];

export const INITIAL_LOGS = [
  { id: 'l1', timestamp: '2026-09-28T11:45:00Z', type: 'CHECK_IN', text: 'Express Check-In completed for Marcus Sterling (Room 201).' },
  { id: 'l2', timestamp: '2026-09-28T11:00:00Z', type: 'BILLING', text: 'Added Spa Service ($140) to Room 201 ledger.' },
  { id: 'l3', timestamp: '2026-09-28T10:15:00Z', type: 'CHECK_OUT', text: 'Guest Eleanor Vance checked out of Room 103. Status changed to Needs Cleaning.' },
  { id: 'l4', timestamp: '2026-09-28T09:30:00Z', type: 'HOUSEKEEPING', text: 'Housekeeping task assigned for Penthouse Room 301.' },
];
