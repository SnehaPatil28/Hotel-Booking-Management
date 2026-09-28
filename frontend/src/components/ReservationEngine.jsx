import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import RoleGuard from './RoleGuard';
import CancellationModal from './CancellationModal';
import { 
  CalendarCheck, 
  Search, 
  UserCheck, 
  LogOut, 
  XCircle, 
  Plus
} from 'lucide-react';

export default function ReservationEngine({ onOpenBookingModal }) {
  const { 
    reservations, 
    performCheckIn, 
    performCheckOut, 
    cancelReservation,
    userRole
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [cancellingRes, setCancellingRes] = useState(null);

  // Guests only see their own "portal" — in a real app this would filter by guest ID.
  // For this demo, guests see all reservations but with limited actions.
  const filteredReservations = reservations.filter(res => {
    const matchesSearch = 
      res.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.roomNumber.includes(searchTerm) ||
      res.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || res.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Confirmed':
        return { bg: 'bg-orange-50 text-orange-600 border-orange-200', label: 'Confirmed' };
      case 'Checked-In':
        return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Checked-In' };
      case 'Checked-Out':
        return { bg: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Checked-Out' };
      case 'Cancelled':
        return { bg: 'bg-rose-50 text-rose-600 border-rose-200', label: 'Cancelled' };
      default:
        return { bg: 'bg-gray-50 text-gray-500 border-gray-200', label: status };
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-orange-500" />
            Reservation Engine & Guest Lifecycle
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage booking lifecycles, guest profiles, check-in/out workflows, and cancellations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200 text-xs">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search guest or room..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-transparent text-gray-800 focus:outline-none w-36 sm:w-48 placeholder-gray-400"
            />
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 focus:outline-none cursor-pointer"
          >
            <option value="All">Status: All</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Checked-In">Checked-In</option>
            <option value="Checked-Out">Checked-Out</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          {/* New booking — staff only, not guests */}
          <RoleGuard allowedRoles={['ADMIN', 'FRONT_DESK']}>
            <button
              onClick={onOpenBookingModal}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              New Booking
            </button>
          </RoleGuard>
        </div>
      </div>

      {/* Reservations table */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold">
                <th className="py-3.5 px-4">RESERVATION ID</th>
                <th className="py-3.5 px-4">GUEST DETAILS</th>
                <th className="py-3.5 px-4">ROOM & TYPE</th>
                <th className="py-3.5 px-4">DATES & NIGHTS</th>
                <th className="py-3.5 px-4">TOTAL STAY</th>
                <th className="py-3.5 px-4">STATUS</th>
                <th className="py-3.5 px-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredReservations.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-gray-400 italic">
                    No reservations found matching current criteria.
                  </td>
                </tr>
              ) : (
                filteredReservations.map(res => {
                  const badge = getStatusBadge(res.status);
                  const totalCost = res.nights * res.nightlyRate;

                  return (
                    <tr key={res.id} className="hover:bg-orange-50/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-orange-500">
                        {res.id}
                      </td>
                      
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-gray-900">{res.guestName}</div>
                        <div className="text-[11px] text-gray-400 flex items-center gap-2 mt-0.5">
                          <span>{res.guestPhone}</span>
                          {res.guestEmail && <span>• {res.guestEmail}</span>}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-extrabold text-gray-900">Room {res.roomNumber}</span>
                        <div className="text-[11px] text-gray-400">{res.category}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-gray-700">{res.checkIn} → {res.checkOut}</div>
                        <div className="text-[11px] text-orange-500 font-medium">{res.nights} Night(s)</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-gray-900">${totalCost.toLocaleString()}</div>
                        <div className="text-[11px]">
                          <span className={res.paymentStatus === 'Paid' ? 'text-emerald-600 font-semibold' : 'text-orange-500 font-semibold'}>
                            {res.paymentStatus}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full font-bold border ${badge.bg}`}>
                          {badge.label}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          
                          {/* Check-In: only staff */}
                          {res.status === 'Confirmed' && (
                            <RoleGuard allowedRoles={['ADMIN', 'FRONT_DESK']}>
                              <button
                                onClick={() => performCheckIn(res.id)}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-sm"
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                                Check-In
                              </button>
                            </RoleGuard>
                          )}

                          {/* Check-Out: only staff */}
                          {res.status === 'Checked-In' && (
                            <RoleGuard allowedRoles={['ADMIN', 'FRONT_DESK']}>
                              <button
                                onClick={() => performCheckOut(res.id)}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-semibold shadow-sm"
                              >
                                <LogOut className="w-3.5 h-3.5" />
                                Check-Out
                              </button>
                            </RoleGuard>
                          )}

                          {/* Cancel: admin and front desk only — guests cannot cancel in this demo */}
                          {(res.status === 'Confirmed' || res.status === 'Checked-In') && (
                            <RoleGuard allowedRoles={['ADMIN', 'FRONT_DESK']}>
                              <button
                                onClick={() => setCancellingRes(res)}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold border border-rose-200"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                Cancel
                              </button>
                            </RoleGuard>
                          )}

                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {cancellingRes && (
        <CancellationModal
          reservation={cancellingRes}
          onClose={() => setCancellingRes(null)}
          onConfirmCancel={(resId) => cancelReservation(resId)}
        />
      )}

    </div>
  );
}
