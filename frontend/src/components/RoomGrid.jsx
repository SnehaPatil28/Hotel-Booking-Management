import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import RoleGuard from './RoleGuard';
import { 
  BedDouble, 
  Filter, 
  Edit3, 
  Wrench, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Users, 
  DollarSign,
  X,
  Sparkles
} from 'lucide-react';

export default function RoomGrid() {
  const { rooms, updateRoomStatus, updateRoomDetails, setRoomMaintenance, clearRoomMaintenance, userRole } = useApp();
  
  const [selectedFloor, setSelectedFloor] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [editingRoom, setEditingRoom] = useState(null);
  const [maintenanceModalRoom, setMaintenanceModalRoom] = useState(null);
  const [maintenanceNote, setMaintenanceNote] = useState('');

  const floors = ['All', '1st Floor', '2nd Floor', 'Penthouse'];
  const statuses = ['All', 'Available', 'Occupied', 'Needs Cleaning', 'Maintenance'];

  const filteredRooms = rooms.filter(room => {
    const matchesFloor = selectedFloor === 'All' || room.floor === selectedFloor;
    const matchesStatus = selectedStatus === 'All' || room.status === selectedStatus;
    return matchesFloor && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Available':
        return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2, label: 'Available' };
      case 'Occupied':
        return { bg: 'bg-blue-50 text-blue-700 border-blue-200', icon: BedDouble, label: 'Occupied' };
      case 'Needs Cleaning':
        return { bg: 'bg-orange-50 text-orange-600 border-orange-200', icon: Clock, label: 'Needs Cleaning' };
      case 'Maintenance':
        return { bg: 'bg-rose-50 text-rose-600 border-rose-200', icon: AlertTriangle, label: 'Maintenance' };
      default:
        return { bg: 'bg-gray-50 text-gray-500 border-gray-200', icon: CheckCircle2, label: status };
    }
  };

  const getAllowedStatusOptions = () => {
    if (userRole === 'HOUSEKEEPING') {
      return ['Available', 'Needs Cleaning', 'Maintenance'];
    }
    if (userRole === 'FRONT_DESK') {
      return ['Available', 'Occupied', 'Needs Cleaning', 'Maintenance'];
    }
    return ['Available', 'Occupied', 'Needs Cleaning', 'Maintenance'];
  };

  const allowedStatuses = getAllowedStatusOptions();

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <BedDouble className="w-6 h-6 text-orange-500" />
            Room Management & Inventory
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Monitor room availability, status transitions, and flag rooms for maintenance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200 text-xs">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-gray-400">Floor:</span>
            <select
              value={selectedFloor}
              onChange={(e) => setSelectedFloor(e.target.value)}
              className="bg-transparent text-gray-700 font-medium focus:outline-none cursor-pointer"
            >
              {floors.map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200 text-xs">
            <span className="text-gray-400">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent text-gray-700 font-medium focus:outline-none cursor-pointer"
            >
              {statuses.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Room cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredRooms.map(room => {
          const badge = getStatusBadge(room.status);
          const BadgeIcon = badge.icon;

          return (
            <div
              key={room.id}
              className="glass-card p-5 rounded-2xl flex flex-col justify-between hover:border-orange-300 transition-all group relative"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-2xl font-extrabold text-gray-900 group-hover:text-orange-500 transition-colors">
                      Room {room.number}
                    </span>
                    <p className="text-xs text-gray-400 font-medium">{room.floor} • {room.category}</p>
                  </div>
                  <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${badge.bg}`}>
                    <BadgeIcon className="w-3.5 h-3.5" />
                    {badge.label}
                  </span>
                </div>

                {room.status === 'Maintenance' && (
                  <div className="mt-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                    <span className="font-bold flex items-center gap-1">
                      <Wrench className="w-3.5 h-3.5 text-rose-500" />
                      Maintenance Reason:
                    </span>
                    <p className="mt-0.5 text-[11px] italic">{room.maintenanceNote || 'Equipment repair'}</p>
                  </div>
                )}

                <div className="mt-4 pt-3 border-t border-gray-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-gray-600">
                    <span className="flex items-center gap-1 text-gray-400">
                      <DollarSign className="w-3.5 h-3.5 text-orange-500" />
                      Nightly Rate:
                    </span>
                    <span className="font-bold text-gray-900">${room.rate} / night</span>
                  </div>

                  <div className="flex items-center justify-between text-gray-600">
                    <span className="flex items-center gap-1 text-gray-400">
                      <Users className="w-3.5 h-3.5 text-blue-400" />
                      Max Guests:
                    </span>
                    <span className="font-semibold text-gray-700">{room.maxOccupancy} Person(s)</span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1">
                    {room.amenities.slice(0, 3).map((amenity, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-gray-100 text-[10px] text-gray-500 border border-gray-200">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                {/* Status dropdown */}
                <RoleGuard allowedRoles={['ADMIN', 'FRONT_DESK', 'HOUSEKEEPING']}>
                  <select
                    value={room.status}
                    onChange={(e) => {
                      if (e.target.value === 'Maintenance') {
                        setMaintenanceModalRoom(room);
                        setMaintenanceNote(room.maintenanceNote || '');
                      } else {
                        updateRoomStatus(room.id, e.target.value);
                      }
                    }}
                    className="bg-gray-50 text-xs font-semibold text-gray-700 px-2.5 py-1.5 rounded-lg border border-gray-200 focus:outline-none cursor-pointer"
                  >
                    {allowedStatuses.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </RoleGuard>

                <div className="flex items-center gap-1">
                  {/* Maintenance flag button */}
                  <RoleGuard allowedRoles={['ADMIN', 'FRONT_DESK', 'HOUSEKEEPING']}>
                    {room.status === 'Maintenance' ? (
                      <button
                        onClick={() => clearRoomMaintenance(room.id)}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition-all border border-emerald-200 flex items-center gap-1"
                        title="Clear Maintenance"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Clear Lock
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setMaintenanceModalRoom(room);
                          setMaintenanceNote(room.maintenanceNote || '');
                        }}
                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-all border border-rose-200 flex items-center gap-1 text-xs font-semibold"
                        title="Put Room Under Maintenance"
                      >
                        <Wrench className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Maintenance</span>
                      </button>
                    )}
                  </RoleGuard>

                  {/* Edit room details — admin only */}
                  <RoleGuard allowedRoles={['ADMIN']}>
                    <button
                      onClick={() => setEditingRoom(room)}
                      className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-all border border-gray-200"
                      title="Edit room details"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </RoleGuard>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit room modal */}
      {editingRoom && (
        <EditRoomModal
          room={editingRoom}
          onClose={() => setEditingRoom(null)}
          onSave={(id, data) => {
            updateRoomDetails(id, data);
            setEditingRoom(null);
          }}
        />
      )}

      {/* Maintenance modal */}
      {maintenanceModalRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm p-6 rounded-2xl shadow-xl border border-gray-200 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-rose-500" />
                <h3 className="text-base font-bold text-gray-900">Put Room {maintenanceModalRoom.number} Under Maintenance</h3>
              </div>
              <button onClick={() => setMaintenanceModalRoom(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Reason / Repair Notes *</label>
              <textarea
                value={maintenanceNote}
                onChange={(e) => setMaintenanceNote(e.target.value)}
                rows={3}
                placeholder="e.g. AC compressor failure, plumbing leak, carpet replacement"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs text-gray-800 focus:outline-none focus:border-rose-400 resize-none"
              />
              <p className="text-[11px] text-rose-500 mt-1">
                ⚠️ Setting a room under maintenance automatically blocks it from new reservation searches.
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setMaintenanceModalRoom(null)}
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-600 text-xs font-semibold hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setRoomMaintenance(maintenanceModalRoom.id, maintenanceNote || 'Under Maintenance');
                  setMaintenanceModalRoom(null);
                }}
                className="px-4 py-2 rounded-lg bg-rose-500 text-white text-xs font-bold hover:bg-rose-600 shadow-sm"
              >
                Set Maintenance Lock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EditRoomModal({ room, onClose, onSave }) {
  const [rate, setRate] = useState(room.rate);
  const [maxOccupancy, setMaxOccupancy] = useState(room.maxOccupancy);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white w-full max-w-sm p-6 rounded-2xl shadow-xl border border-gray-200 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h3 className="text-base font-bold text-gray-900">Edit Room {room.number}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-gray-500 font-medium mb-1">Nightly Rate ($)</label>
            <input
              type="number"
              value={rate}
              onChange={e => setRate(Number(e.target.value))}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-gray-800 focus:outline-none focus:border-orange-400"
            />
          </div>
          <div>
            <label className="block text-gray-500 font-medium mb-1">Max Occupancy</label>
            <input
              type="number"
              value={maxOccupancy}
              onChange={e => setMaxOccupancy(Number(e.target.value))}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-gray-800 focus:outline-none focus:border-orange-400"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-100 text-gray-600 text-xs font-semibold hover:bg-gray-200">
            Cancel
          </button>
          <button
            onClick={() => onSave(room.id, { rate, maxOccupancy })}
            className="px-4 py-2 rounded-lg bg-orange-500 text-white text-xs font-bold hover:bg-orange-600"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
