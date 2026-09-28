import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { calculateBill } from '../services/billingCalculator';
import RoleGuard from './RoleGuard';
import { 
  Receipt, 
  Plus, 
  Printer, 
  Coffee, 
  Wine, 
  Sparkles, 
  Shirt, 
  Car,
  X,
  Building2
} from 'lucide-react';

export default function BillingModule() {
  const { reservations, billingItems, addBillingItem } = useApp();

  const activeReservations = reservations.filter(r => r.status === 'Checked-In' || r.status === 'Confirmed' || r.status === 'Checked-Out');

  const [selectedResId, setSelectedResId] = useState(activeReservations[0]?.id || '');
  const [showAddChargeModal, setShowAddChargeModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  const [chargeCategory, setChargeCategory] = useState('Room Service');
  const [chargeDescription, setChargeDescription] = useState('');
  const [chargeAmount, setChargeAmount] = useState('');

  const currentReservation = reservations.find(r => r.id === selectedResId) || activeReservations[0];
  const currentLineItems = billingItems.filter(item => item.reservationId === currentReservation?.id);

  const billCalc = calculateBill({
    reservation: currentReservation,
    lineItems: currentLineItems,
  });

  const handleAddCharge = (e) => {
    e.preventDefault();
    if (!currentReservation || !chargeAmount) return;

    addBillingItem({
      reservationId: currentReservation.id,
      roomNumber: currentReservation.roomNumber,
      category: chargeCategory,
      description: chargeDescription || chargeCategory,
      amount: Number(chargeAmount),
    });

    setChargeDescription('');
    setChargeAmount('');
    setShowAddChargeModal(false);
  };

  const serviceCategories = [
    { name: 'Room Service', icon: Coffee },
    { name: 'Minibar', icon: Wine },
    { name: 'Spa', icon: Sparkles },
    { name: 'Laundry', icon: Shirt },
    { name: 'Parking', icon: Car },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Receipt className="w-6 h-6 text-orange-500" />
            Billing & Invoice Generator
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Ledger posting, room service charges, tax calculation, and invoice printing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-gray-500">Select Ledger:</label>
          <select
            value={selectedResId}
            onChange={(e) => setSelectedResId(e.target.value)}
            className="bg-gray-50 border border-gray-200 text-gray-800 text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none cursor-pointer focus:border-orange-400"
          >
            {activeReservations.map(r => (
              <option key={r.id} value={r.id}>
                Room {r.roomNumber} — {r.guestName} ({r.id})
              </option>
            ))}
          </select>
        </div>
      </div>

      {!currentReservation ? (
        <div className="glass-panel p-8 text-center text-gray-400 rounded-2xl">
          No active reservations available to bill.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Ledger */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-panel p-6 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-gray-900">
                    Room {currentReservation.roomNumber} — Ledger
                  </h2>
                  <p className="text-xs text-gray-400">Guest: {currentReservation.guestName}</p>
                </div>

                {/* Add charges — admin and front desk only */}
                <RoleGuard allowedRoles={['ADMIN', 'FRONT_DESK']}>
                  <button
                    onClick={() => setShowAddChargeModal(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white transition-all shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add Charge
                  </button>
                </RoleGuard>
              </div>

              <div className="overflow-x-auto border border-gray-100 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
                    <tr>
                      <th className="py-3 px-4">CATEGORY</th>
                      <th className="py-3 px-4">DESCRIPTION</th>
                      <th className="py-3 px-4">DATE</th>
                      <th className="py-3 px-4 text-right">AMOUNT ($)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr className="font-semibold text-gray-700">
                      <td className="py-3 px-4 text-orange-500">Lodging</td>
                      <td className="py-3 px-4">
                        Room Accommodation ({currentReservation.nights} nights @ ${currentReservation.nightlyRate}/night)
                      </td>
                      <td className="py-3 px-4 text-gray-400">{currentReservation.checkIn}</td>
                      <td className="py-3 px-4 text-right font-bold text-gray-900">
                        ${billCalc.formattedRoomSubtotal}
                      </td>
                    </tr>

                    {currentLineItems.map(item => (
                      <tr key={item.id} className="hover:bg-gray-50 text-gray-600">
                        <td className="py-3 px-4 font-semibold text-blue-600">{item.category}</td>
                        <td className="py-3 px-4">{item.description}</td>
                        <td className="py-3 px-4 text-gray-400">
                          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-gray-900">
                          ${Number(item.amount).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Financial summary */}
          <div className="glass-panel p-6 rounded-2xl space-y-5 flex flex-col justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900 pb-3 border-b border-gray-100">
                Financial Summary
              </h2>

              <div className="mt-4 space-y-3 text-xs">
                <div className="flex justify-between text-gray-500">
                  <span>Room Subtotal:</span>
                  <span className="font-bold text-gray-900">${billCalc.formattedRoomSubtotal}</span>
                </div>

                <div className="flex justify-between text-gray-500">
                  <span>Services Subtotal:</span>
                  <span className="font-bold text-gray-900">${billCalc.formattedExtrasSubtotal}</span>
                </div>

                <div className="flex justify-between text-gray-700 pt-2 border-t border-gray-100 font-semibold">
                  <span>Combined Subtotal:</span>
                  <span>${billCalc.formattedSubtotal}</span>
                </div>

                <div className="flex justify-between text-gray-500">
                  <span>Occupancy Tax (12%):</span>
                  <span className="text-emerald-600">+${billCalc.formattedTax}</span>
                </div>

                <div className="flex justify-between text-gray-500">
                  <span>Service Charge (5%):</span>
                  <span className="text-emerald-600">+${billCalc.formattedServiceFee}</span>
                </div>

                <div className="pt-3 border-t border-gray-200 flex justify-between text-base font-extrabold">
                  <span className="text-gray-900">Total Balance Due:</span>
                  <span className="text-orange-500">${billCalc.formattedGrandTotal}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowInvoiceModal(true)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-sm transition-all"
            >
              <Printer className="w-4 h-4" />
              Generate Invoice
            </button>
          </div>

        </div>
      )}

      {/* Add charge modal */}
      {showAddChargeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-xl border border-gray-200 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">Post Extra Charge</h3>
              <button onClick={() => setShowAddChargeModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCharge} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-500 font-medium mb-1">Service Category</label>
                <select
                  value={chargeCategory}
                  onChange={(e) => setChargeCategory(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-gray-800 focus:outline-none focus:border-orange-400"
                >
                  {serviceCategories.map(cat => (
                    <option key={cat.name} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-500 font-medium mb-1">Description</label>
                <input
                  type="text"
                  required
                  value={chargeDescription}
                  onChange={(e) => setChargeDescription(e.target.value)}
                  placeholder="e.g. Club Sandwich & Champagne"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-gray-800 focus:outline-none focus:border-orange-400"
                />
              </div>

              <div>
                <label className="block text-gray-500 font-medium mb-1">Amount ($)</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="1"
                  value={chargeAmount}
                  onChange={(e) => setChargeAmount(e.target.value)}
                  placeholder="45.00"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-gray-800 focus:outline-none focus:border-orange-400"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddChargeModal(false)}
                  className="px-4 py-2 rounded-lg bg-gray-100 text-gray-600 font-semibold hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-orange-500 text-white font-bold hover:bg-orange-600"
                >
                  Post Charge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice modal */}
      {showInvoiceModal && currentReservation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="bg-white text-gray-900 w-full max-w-2xl p-8 rounded-2xl shadow-2xl space-y-6 print:p-0 print:shadow-none font-sans">
            <div className="flex items-center justify-between border-b pb-6 border-gray-200">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-orange-500 text-white flex items-center justify-center">
                  <Building2 className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold tracking-wide text-gray-900">AURA BOUTIQUE HOTEL</h2>
                  <p className="text-xs text-gray-400">Luxury Hospitality & Suites</p>
                </div>
              </div>

              <div className="text-right">
                <h3 className="text-lg font-bold text-gray-800">OFFICIAL INVOICE</h3>
                <p className="text-xs text-gray-400">Invoice #{currentReservation.id.toUpperCase()}</p>
                <p className="text-xs text-gray-400">Date: {new Date().toLocaleDateString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 text-xs bg-gray-50 p-4 rounded-xl border border-gray-200">
              <div>
                <p className="text-gray-400 font-semibold uppercase text-[10px]">Guest Information</p>
                <p className="font-bold text-sm text-gray-900 mt-1">{currentReservation.guestName}</p>
                <p className="text-gray-500">{currentReservation.guestEmail}</p>
              </div>

              <div>
                <p className="text-gray-400 font-semibold uppercase text-[10px]">Room & Stay</p>
                <p className="font-bold text-sm text-gray-900 mt-1">Room {currentReservation.roomNumber} ({currentReservation.category})</p>
                <p className="text-gray-500">Check-in: {currentReservation.checkIn} → {currentReservation.checkOut}</p>
              </div>
            </div>

            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-900 text-gray-600 font-bold uppercase text-[10px]">
                  <th className="py-2">Item Description</th>
                  <th className="py-2">Category</th>
                  <th className="py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="py-2.5 font-medium">Room Lodging ({currentReservation.nights} nights @ ${currentReservation.nightlyRate})</td>
                  <td className="py-2.5 text-gray-400">Accommodation</td>
                  <td className="py-2.5 text-right font-semibold">${billCalc.formattedRoomSubtotal}</td>
                </tr>
                {currentLineItems.map(item => (
                  <tr key={item.id}>
                    <td className="py-2.5">{item.description}</td>
                    <td className="py-2.5 text-gray-400">{item.category}</td>
                    <td className="py-2.5 text-right font-semibold">${Number(item.amount).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pt-4 border-t border-gray-200 flex justify-end">
              <div className="w-64 space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal:</span>
                  <span className="font-semibold">${billCalc.formattedSubtotal}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Occupancy Tax (12%):</span>
                  <span>${billCalc.formattedTax}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Service Charge (5%):</span>
                  <span>${billCalc.formattedServiceFee}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-gray-900 pt-2 border-t border-gray-900">
                  <span>Grand Total:</span>
                  <span>${billCalc.formattedGrandTotal}</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200 flex items-center justify-between print:hidden">
              <span className="text-xs text-gray-400">Thank you for staying at Aura Boutique Hotel!</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowInvoiceModal(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs"
                >
                  Close
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-5 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs shadow flex items-center gap-2"
                >
                  <Printer className="w-4 h-4 text-orange-400" />
                  Print / Export PDF
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
