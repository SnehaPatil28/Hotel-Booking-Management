import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import RoleGuard from './RoleGuard';
import { 
  Broom, 
  CheckCircle2, 
  Clock, 
  Wrench, 
  Sparkles,
  Plus,
  X
} from 'lucide-react';

export default function HousekeepingTracker() {
  const { 
    rooms, 
    housekeepingTasks, 
    markRoomClean, 
    setRoomMaintenance, 
    clearRoomMaintenance,
    userRole 
  } = useApp();

  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [selectedRoomNumber, setSelectedRoomNumber] = useState(rooms[0]?.number || '');
  const [maintenanceNote, setMaintenanceNote] = useState('');

  const dirtyRooms = rooms.filter(r => r.status === 'Needs Cleaning');
  const maintenanceRooms = rooms.filter(r => r.status === 'Maintenance');

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'Urgent':
        return 'bg-rose-50 text-rose-600 border-rose-200';
      case 'High':
        return 'bg-orange-50 text-orange-600 border-orange-200';
      case 'Medium':
        return 'bg-blue-50 text-blue-600 border-blue-200';
      default:
        return 'bg-gray-50 text-gray-500 border-gray-200';
    }
  };

  const handlePutMaintenance = (e) => {
    e.preventDefault();
    if (!selectedRoomNumber) return;
    setRoomMaintenance(selectedRoomNumber, maintenanceNote || 'Under Maintenance');
    setMaintenanceNote('');
    setShowMaintenanceModal(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Broom className="w-6 h-6 text-orange-500" />
            Housekeeping & Room Maintenance
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Cleaning task queue, single-click "Mark Ready" room readying, and maintenance reporting.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="px-3.5 py-2 rounded-xl bg-orange-50 border border-orange-200 text-orange-600 font-semibold">
            {dirtyRooms.length} Pending Clean
          </div>

          <div className="px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 font-semibold">
            {maintenanceRooms.length} Maintenance Lock
          </div>

          <RoleGuard allowedRoles={['ADMIN', 'FRONT_DESK', 'HOUSEKEEPING']}>
            <button
              onClick={() => setShowMaintenanceModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-sm transition-all"
            >
              <Wrench className="w-4 h-4" />
              Put Room Under Maintenance
            </button>
          </RoleGuard>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Cleaning queue with 1-Click Ready */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-500" />
              Dirty Room Cleaning Queue ({dirtyRooms.length})
            </h2>
            <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Single-Click Readying
            </span>
          </div>

          <div className="space-y-3">
            {dirtyRooms.length === 0 ? (
              <div className="p-8 text-center text-gray-400 italic border border-dashed border-gray-200 rounded-xl">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                All rooms are cleaned and ready for guests!
              </div>
            ) : (
              dirtyRooms.map(room => (
                <div
                  key={room.id}
                  className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between gap-4 hover:border-orange-300 transition-all"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-extrabold text-gray-900">Room {room.number}</span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-orange-50 text-orange-600 border border-orange-200">
                        {room.category}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Floor: {room.floor} • Standard Turn-down</p>
                  </div>

                  {/* Single-Click Mark Ready Button */}
                  <RoleGuard allowedRoles={['ADMIN', 'FRONT_DESK', 'HOUSEKEEPING']}>
                    <button
                      onClick={() => markRoomClean(room.number)}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20 transition-all hover:scale-[1.02]"
                    >
                      <Sparkles className="w-4 h-4" />
                      Mark Ready
                    </button>
                  </RoleGuard>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Maintenance Queue */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-rose-500" />
              Rooms Under Maintenance ({maintenanceRooms.length})
            </h2>
            <span className="text-xs text-rose-500 font-semibold">Blocked from Search</span>
          </div>

          <div className="space-y-3">
            {maintenanceRooms.length === 0 ? (
              <div className="p-8 text-center text-gray-400 italic border border-dashed border-gray-200 rounded-xl">
                No active maintenance locks reported.
              </div>
            ) : (
              maintenanceRooms.map(room => (
                <div
                  key={room.id}
                  className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2 hover:border-rose-300 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-gray-900">Room {room.number} ({room.category})</span>
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-rose-50 text-rose-600 border border-rose-200">
                      Maintenance
                    </span>
                  </div>

                  <p className="text-xs text-rose-700 bg-rose-50 p-2.5 rounded-lg border border-rose-100 font-medium">
                    <strong>Issue:</strong> {room.maintenanceNote || 'Equipment repair in progress'}
                  </p>

                  <div className="pt-2 flex items-center justify-end">
                    <RoleGuard allowedRoles={['ADMIN', 'FRONT_DESK', 'HOUSEKEEPING']}>
                      <button
                        onClick={() => clearRoomMaintenance(room.number)}
                        className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Clear Issue & Mark Available
                      </button>
                    </RoleGuard>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Put Room Under Maintenance Modal */}
      {showMaintenanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-xl border border-gray-200 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-rose-500" />
                <h3 className="text-base font-bold text-gray-900">Put Room Under Maintenance</h3>
              </div>
              <button onClick={() => setShowMaintenanceModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePutMaintenance} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-500 font-medium mb-1">Select Room *</label>
                <select
                  value={selectedRoomNumber}
                  onChange={(e) => setSelectedRoomNumber(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-gray-800 focus:outline-none focus:border-rose-400 font-semibold"
                >
                  {rooms.map(room => (
                    <option key={room.id} value={room.number}>
                      Room {room.number} ({room.category}) — Currently: {room.status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-500 font-medium mb-1">Maintenance Notes / Reason *</label>
                <textarea
                  required
                  rows={3}
                  value={maintenanceNote}
                  onChange={(e) => setMaintenanceNote(e.target.value)}
                  placeholder="e.g. Broken shower head, AC unit inspection, painting..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-gray-800 focus:outline-none focus:border-rose-400 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowMaintenanceModal(false)}
                  className="px-4 py-2 rounded-lg bg-gray-100 text-gray-600 font-semibold hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-rose-500 text-white font-bold hover:bg-rose-600 shadow-sm"
                >
                  Set Maintenance Lock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
