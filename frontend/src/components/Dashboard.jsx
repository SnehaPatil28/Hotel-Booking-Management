import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import RoleGuard from './RoleGuard';
import { 
  Building, 
  TrendingUp, 
  UserCheck, 
  LogOut,
  Broom, 
  DollarSign, 
  PlusCircle, 
  Sparkles,
  BedDouble,
  Activity,
  X,
  CheckCircle2,
  Clock
} from 'lucide-react';

export default function Dashboard({ setActiveTab, onOpenBookingModal }) {
  const { 
    rooms, 
    reservations, 
    housekeepingTasks, 
    logs, 
    userRole,
    performCheckIn,
    markRoomClean
  } = useApp();

  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showCleanModal, setShowCleanModal] = useState(false);

  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter(r => r.status === 'Occupied').length;
  const needsCleaning = rooms.filter(r => r.status === 'Needs Cleaning').length;
  const maintenanceRooms = rooms.filter(r => r.status === 'Maintenance').length;
  const availableRooms = rooms.filter(r => r.status === 'Available').length;

  const todayStr = new Date().toISOString().split('T')[0];

  // 1. Occupancy Rate (%)
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  // 2. Today's Check-ins (Checked-In or Confirmed arriving today)
  const todaysCheckIns = reservations.filter(r => 
    r.status === 'Checked-In' || (r.status === 'Confirmed' && r.checkIn <= todayStr)
  ).length;

  // 3. Today's Check-outs (Checked-Out or Checked-In departing today)
  const todaysCheckOuts = reservations.filter(r => 
    r.status === 'Checked-Out' || (r.status === 'Checked-In' && r.checkOut <= todayStr)
  ).length;

  // 4. Rooms Needing Cleaning
  const roomsNeedingCleaning = needsCleaning;

  // 5. Daily Revenue
  const dailyRevenue = reservations
    .filter(r => r.status === 'Checked-In' || r.status === 'Checked-Out')
    .reduce((sum, r) => sum + (r.nights * r.nightlyRate), 0);

  // Eligible for Express Check-in: Confirmed reservations
  const pendingArrivals = reservations.filter(r => r.status === 'Confirmed');

  // Eligible for Mark Clean: Needs Cleaning rooms
  const dirtyRoomsList = rooms.filter(r => r.status === 'Needs Cleaning');

  const roleLabels = {
    ADMIN: 'Admin / Manager',
    FRONT_DESK: 'Front Desk Agent',
    HOUSEKEEPING: 'Housekeeping Staff',
    GUEST: 'Guest Portal',
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Quick Action Buttons */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm border border-gray-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Operations Dashboard</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-50 text-orange-600 border border-orange-200">
              {roleLabels[userRole] || userRole}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Essential daily front-desk metrics, quick actions, and real-time room occupancy.
          </p>
        </div>

        {/* Primary Quick Action Buttons */}
        <RoleGuard allowedRoles={['ADMIN', 'FRONT_DESK', 'HOUSEKEEPING']}>
          <div className="flex flex-wrap items-center gap-2.5">
            
            {/* [New Booking] Button */}
            <button
              onClick={onOpenBookingModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/20 transition-all hover:scale-[1.02]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Booking</span>
            </button>

            {/* [Express Check-in] Button */}
            <button
              onClick={() => setShowCheckInModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 transition-all hover:scale-[1.02]"
            >
              <UserCheck className="w-4 h-4" />
              <span>Express Check-in</span>
            </button>

            {/* [Mark Room Clean] Button */}
            <button
              onClick={() => setShowCleanModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02]"
            >
              <Sparkles className="w-4 h-4" />
              <span>Mark Room Clean</span>
            </button>

          </div>
        </RoleGuard>
      </div>

      {/* 5 Essential Daily Front-Desk KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* KPI 1: Occupancy Rate (%) */}
        <div className="glass-card p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between text-gray-500 text-xs font-bold tracking-wider">
            <span>OCCUPANCY RATE</span>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-gray-900">{occupancyRate}%</span>
            <span className="text-xs font-semibold text-blue-600">{occupiedRooms}/{totalRooms} Rooms</span>
          </div>
          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: `${occupancyRate}%` }} />
          </div>
        </div>

        {/* KPI 2: Today's Check-ins */}
        <div className="glass-card p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between text-gray-500 text-xs font-bold tracking-wider">
            <span>TODAY'S CHECK-INS</span>
            <UserCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-gray-900">{todaysCheckIns}</span>
            <span className="text-xs font-semibold text-emerald-600">{pendingArrivals.length} Pending</span>
          </div>
          <p className="text-[11px] text-gray-400">Guest arrivals & checked-in stays</p>
        </div>

        {/* KPI 3: Today's Check-outs */}
        <div className="glass-card p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between text-gray-500 text-xs font-bold tracking-wider">
            <span>TODAY'S CHECK-OUTS</span>
            <LogOut className="w-4 h-4 text-orange-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-gray-900">{todaysCheckOuts}</span>
            <span className="text-xs font-semibold text-orange-600">Active Stays</span>
          </div>
          <p className="text-[11px] text-gray-400">Scheduled departures & completed</p>
        </div>

        {/* KPI 4: Rooms Needing Cleaning */}
        <div className="glass-card p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between text-gray-500 text-xs font-bold tracking-wider">
            <span>NEEDS CLEANING</span>
            <Broom className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-gray-900">{roomsNeedingCleaning}</span>
            <span className="text-xs font-semibold text-amber-600">{maintenanceRooms} Maintenance</span>
          </div>
          <p className="text-[11px] text-gray-400">Housekeeping turn-down queue</p>
        </div>

        {/* KPI 5: Daily Revenue */}
        <div className="glass-card p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between text-gray-500 text-xs font-bold tracking-wider">
            <span>DAILY REVENUE</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-gray-900">${dailyRevenue.toLocaleString()}</span>
            <span className="text-xs font-semibold text-emerald-600">Subtotal</span>
          </div>
          <p className="text-[11px] text-gray-400">Active stay room revenues</p>
        </div>

      </div>

      {/* Clean Operations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Room Inventory Status Overview */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl space-y-5">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <BedDouble className="w-5 h-5 text-orange-500" />
                Live Room Status Distribution
              </h2>
              <p className="text-xs text-gray-400">Real-time room availability across the property.</p>
            </div>
            <button
              onClick={() => setActiveTab('rooms')}
              className="text-xs font-bold text-orange-500 hover:text-orange-600 transition-colors"
            >
              View Full Room Grid →
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-100">
              <span className="text-xs font-bold text-emerald-700 block">Available Ready</span>
              <span className="text-3xl font-extrabold text-emerald-700 mt-1 block">{availableRooms}</span>
              <span className="text-[11px] text-emerald-600 font-medium">Ready for check-in</span>
            </div>

            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100">
              <span className="text-xs font-bold text-blue-700 block">Occupied</span>
              <span className="text-3xl font-extrabold text-blue-700 mt-1 block">{occupiedRooms}</span>
              <span className="text-[11px] text-blue-600 font-medium">Guests checked-in</span>
            </div>

            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-100">
              <span className="text-xs font-bold text-amber-700 block">Needs Cleaning</span>
              <span className="text-3xl font-extrabold text-amber-700 mt-1 block">{needsCleaning}</span>
              <span className="text-[11px] text-amber-600 font-medium">Dirty / Turn-down</span>
            </div>

            <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-100">
              <span className="text-xs font-bold text-rose-700 block">Under Maintenance</span>
              <span className="text-3xl font-extrabold text-rose-700 mt-1 block">{maintenanceRooms}</span>
              <span className="text-[11px] text-rose-600 font-medium">Blocked from booking</span>
            </div>
          </div>
        </div>

        {/* Live Activity Feed */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-500" />
              Live Audit Feed
            </h2>
            <span className="text-[11px] font-mono font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">
              REAL-TIME
            </span>
          </div>

          <div className="mt-4 space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
            {logs.length === 0 ? (
              <p className="text-xs text-gray-400 italic">No operational logs recorded yet.</p>
            ) : (
              logs.slice(0, 6).map(log => (
                <div key={log.id} className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs space-y-1">
                  <div className="flex items-center justify-between text-gray-400 text-[11px]">
                    <span className="font-bold text-orange-600">{log.type}</span>
                    <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-gray-700 font-medium">{log.text}</p>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Quick Express Check-in Modal */}
      {showCheckInModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white w-full max-w-lg p-6 rounded-2xl shadow-xl border border-gray-200 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <UserCheck className="w-6 h-6 text-blue-600" />
                <h3 className="text-base font-bold text-gray-900">Express Check-In Queue</h3>
              </div>
              <button onClick={() => setShowCheckInModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {pendingArrivals.length === 0 ? (
                <div className="p-6 text-center text-gray-400 italic text-xs border border-dashed rounded-xl">
                  No confirmed pending arrivals to check in.
                </div>
              ) : (
                pendingArrivals.map(res => (
                  <div key={res.id} className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="font-bold text-gray-900 text-sm block">{res.guestName}</span>
                      <span className="text-gray-500">Room {res.roomNumber} ({res.category}) • {res.nights} night(s)</span>
                    </div>
                    <button
                      onClick={() => {
                        performCheckIn(res.id);
                        setShowCheckInModal(false);
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-sm transition-all"
                    >
                      Process Check-In
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quick Mark Room Clean Modal */}
      {showCleanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white w-full max-w-lg p-6 rounded-2xl shadow-xl border border-gray-200 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-emerald-600" />
                <h3 className="text-base font-bold text-gray-900">Rooms Needing Cleaning</h3>
              </div>
              <button onClick={() => setShowCleanModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {dirtyRoomsList.length === 0 ? (
                <div className="p-6 text-center text-gray-400 italic text-xs border border-dashed rounded-xl">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                  All rooms are clean and available!
                </div>
              ) : (
                dirtyRoomsList.map(room => (
                  <div key={room.id} className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="font-bold text-gray-900 text-sm block">Room {room.number} ({room.category})</span>
                      <span className="text-gray-500">Floor: {room.floor}</span>
                    </div>
                    <button
                      onClick={() => {
                        markRoomClean(room.number);
                        setShowCleanModal(false);
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-sm transition-all flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Mark Ready
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
