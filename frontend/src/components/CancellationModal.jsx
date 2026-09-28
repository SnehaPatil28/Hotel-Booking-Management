import React from 'react';
import { calculateCancellationRefund } from '../services/cancellationEngine';
import { RefreshCw, X, ShieldAlert } from 'lucide-react';

export default function CancellationModal({ reservation, onClose, onConfirmCancel }) {
  if (!reservation) return null;

  const calc = calculateCancellationRefund(reservation);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white w-full max-w-lg p-6 rounded-2xl shadow-xl border border-gray-200 space-y-5">
        
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-rose-500" />
            <h3 className="text-base font-bold text-gray-900">Cancellation & Refund</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Reservation summary */}
        <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-xs space-y-1">
          <div className="flex justify-between font-bold text-gray-900">
            <span>{reservation.guestName}</span>
            <span className="text-orange-500">Res ID: {reservation.id}</span>
          </div>
          <p className="text-gray-500">
            Room {reservation.roomNumber} ({reservation.category}) • Check-in: {reservation.checkIn} ({reservation.nights} nights)
          </p>
        </div>

        {/* Policy tier */}
        <div className="p-4 rounded-xl bg-orange-50 border border-orange-200 text-xs space-y-2">
          <div className="flex items-center justify-between font-semibold text-orange-700">
            <span>Applied Policy Tier:</span>
            <span className="px-2 py-0.5 rounded bg-orange-100 border border-orange-300 font-bold">
              {calc.policyTier}
            </span>
          </div>
          <p className="text-gray-600 text-[11px]">
            Lead time: <strong>{calc.hoursUntilCheckIn} hours</strong> before scheduled check-in.
          </p>
        </div>

        {/* Refund breakdown */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs space-y-2">
          <div className="flex justify-between text-gray-500">
            <span>Total Stay Amount:</span>
            <span className="font-semibold text-gray-900">${calc.formattedTotalPaid}</span>
          </div>
          <div className="flex justify-between text-emerald-600">
            <span>Refund Percentage:</span>
            <span className="font-bold">{calc.refundPercentage}%</span>
          </div>
          <div className="flex justify-between text-rose-500">
            <span>Penalty Charge ({calc.penaltyPercentage}%):</span>
            <span className="font-semibold">${calc.formattedPenaltyAmount}</span>
          </div>
          <div className="pt-2 border-t border-gray-200 flex justify-between text-sm font-extrabold">
            <span className="text-gray-900">Net Guest Refund:</span>
            <span className="text-emerald-600">${calc.formattedRefundAmount}</span>
          </div>
        </div>

        {/* Room re-release note */}
        <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 p-3 rounded-xl border border-blue-200">
          <RefreshCw className="w-4 h-4 shrink-0" />
          <span>Room {reservation.roomNumber} will be re-released to available inventory immediately.</span>
        </div>

        <div className="flex items-center justify-end gap-3 pt-1">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs transition-all"
          >
            Keep Reservation
          </button>
          <button
            onClick={() => {
              onConfirmCancel(reservation.id);
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-sm transition-all"
          >
            Confirm Cancellation
          </button>
        </div>

      </div>
    </div>
  );
}
