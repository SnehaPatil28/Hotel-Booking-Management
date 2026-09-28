import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { checkRoomAvailability } from '../utils/roomValidation';
import { User, Mail, Phone, BedDouble, X, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function BookingModal({ isOpen, onClose }) {
  const { rooms, reservations, createReservation } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 2);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [checkIn, setCheckIn] = useState(todayStr);
  const [checkOut, setCheckOut] = useState(tomorrowStr);
  const [specialRequests, setSpecialRequests] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [formError, setFormError] = useState('');

  // Evaluate room availability whenever checkIn, checkOut, rooms, or reservations change
  const roomEvaluations = rooms.map(room => {
    const evalResult = checkRoomAvailability(room, checkIn, checkOut, reservations);
    return {
      room,
      ...evalResult,
    };
  });

  const availableEvaluations = roomEvaluations.filter(e => e.available);

  // Auto-select first available room whenever date selection changes
  useEffect(() => {
    if (availableEvaluations.length > 0) {
      const isSelectedStillValid = availableEvaluations.some(e => e.room.id === selectedRoomId);
      if (!isSelectedStillValid) {
        setSelectedRoomId(availableEvaluations[0].room.id);
      }
    } else {
      setSelectedRoomId('');
    }
  }, [checkIn, checkOut, rooms, reservations]);

  if (!isOpen) return null;

  const d1 = new Date(checkIn);
  const d2 = new Date(checkOut);
  const diffTime = Math.max(d2.getTime() - d1.getTime(), 0);
  const nights = Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 1);

  const selectedRoomEval = roomEvaluations.find(e => e.room.id === selectedRoomId);
  const selectedRoom = selectedRoomEval?.room || rooms[0];
  const nightlyRate = selectedRoom?.rate || 0;
  const totalCost = nights * nightlyRate;

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!guestName.trim()) {
      setFormError('Please enter the guest full name.');
      return;
    }

    if (!selectedRoomId || !selectedRoomEval || !selectedRoomEval.available) {
      setFormError('The selected room is unavailable or booked for the chosen dates. Please choose an available room.');
      return;
    }

    createReservation({
      guestName: guestName.trim(),
      guestEmail: guestEmail.trim(),
      guestPhone: guestPhone.trim(),
      roomId: selectedRoom.id,
      roomNumber: selectedRoom.number,
      category: selectedRoom.category,
      checkIn,
      checkOut,
      nights,
      nightlyRate,
      specialRequests: specialRequests.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-xl p-6 rounded-2xl shadow-2xl border border-gray-200 space-y-5">
        
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <BedDouble className="w-6 h-6 text-orange-500" />
            <h3 className="text-base font-bold text-gray-900">New Reservation (Validated Availability)</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {formError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-gray-500 font-medium mb-1">Guest Full Name *</label>
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-2">
                <User className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  required
                  value={guestName}
                  onChange={e => setGuestName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="bg-transparent text-gray-800 focus:outline-none w-full placeholder-gray-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-500 font-medium mb-1">Email Address</label>
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={guestEmail}
                  onChange={e => setGuestEmail(e.target.value)}
                  placeholder="alex@example.com"
                  className="bg-transparent text-gray-800 focus:outline-none w-full placeholder-gray-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-500 font-medium mb-1">Phone Number</label>
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  value={guestPhone}
                  onChange={e => setGuestPhone(e.target.value)}
                  placeholder="+1 555-0100"
                  className="bg-transparent text-gray-800 focus:outline-none w-full placeholder-gray-400"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-500 font-medium mb-1">Check-In Date *</label>
              <input
                type="date"
                required
                min={todayStr}
                value={checkIn}
                onChange={e => setCheckIn(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-gray-800 focus:outline-none focus:border-orange-400"
              />
            </div>
            <div>
              <label className="block text-gray-500 font-medium mb-1">Check-Out Date *</label>
              <input
                type="date"
                required
                min={checkIn || todayStr}
                value={checkOut}
                onChange={e => setCheckOut(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-gray-800 focus:outline-none focus:border-orange-400"
              />
            </div>
          </div>

          {/* Room Selector with Disabled Unavailable Options */}
          <div>
            <label className="block text-gray-500 font-medium mb-1">Select Room (Filtered by Availability & Maintenance)</label>
            
            {availableEvaluations.length === 0 ? (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
                <span>No rooms available for {checkIn} to {checkOut}. Rooms are either occupied, under maintenance, or booked for overlapping dates.</span>
              </div>
            ) : (
              <select
                value={selectedRoomId}
                onChange={e => setSelectedRoomId(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-gray-800 focus:outline-none focus:border-orange-400"
              >
                {roomEvaluations.map(({ room, available, reason }) => (
                  <option
                    key={room.id}
                    value={room.id}
                    disabled={!available}
                    className={!available ? 'text-gray-400 bg-gray-100' : 'text-gray-900 font-semibold'}
                  >
                    Room {room.number} ({room.category} — ${room.rate}/night) — {available ? '✅ Available' : `❌ ${reason}`}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-gray-500 font-medium mb-1">Special Requests</label>
            <input
              type="text"
              value={specialRequests}
              onChange={e => setSpecialRequests(e.target.value)}
              placeholder="e.g. Quiet room, extra towels, early check-in"
              className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-gray-800 focus:outline-none focus:border-orange-400"
            />
          </div>

          {/* Cost summary */}
          {selectedRoomEval?.available && (
            <div className="p-4 rounded-xl bg-orange-50 border border-orange-200 space-y-2">
              <div className="flex justify-between font-semibold text-gray-700">
                <span>Selected Room:</span>
                <span className="font-bold text-gray-900">Room {selectedRoom.number} ({selectedRoom.category})</span>
              </div>
              <div className="flex justify-between font-semibold text-gray-700">
                <span>Duration:</span>
                <span className="text-orange-600 font-bold">{nights} Night(s)</span>
              </div>
              <div className="flex justify-between font-semibold text-gray-700">
                <span>Nightly Rate:</span>
                <span className="text-gray-900">${nightlyRate} / night</span>
              </div>
              <div className="pt-2 border-t border-orange-200 flex justify-between font-extrabold text-sm">
                <span className="text-gray-900">Estimated Total:</span>
                <span className="text-orange-600 text-base">${totalCost.toLocaleString()}</span>
              </div>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-gray-100 text-gray-600 font-semibold hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedRoomId || !selectedRoomEval?.available}
              className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold shadow-sm transition-all"
            >
              Confirm Booking
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
