export const TAX_RATE = 0.12; // 12% Local Occupancy Tax
export const SERVICE_FEE_RATE = 0.05; // 5% Service Fee

export function calculateBill({ reservation, lineItems = [] }) {
  if (!reservation) {
    return {
      roomSubtotal: 0,
      extrasSubtotal: 0,
      subtotal: 0,
      tax: 0,
      serviceFee: 0,
      grandTotal: 0,
    };
  }

  const roomSubtotal = (reservation.nights || 1) * (reservation.nightlyRate || 0);
  
  const extrasSubtotal = lineItems
    .filter(item => item.reservationId === reservation.id)
    .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  const subtotal = roomSubtotal + extrasSubtotal;
  const tax = subtotal * TAX_RATE;
  const serviceFee = subtotal * SERVICE_FEE_RATE;
  const grandTotal = subtotal + tax + serviceFee;

  return {
    roomSubtotal,
    extrasSubtotal,
    subtotal,
    tax,
    serviceFee,
    grandTotal,
    formattedRoomSubtotal: roomSubtotal.toFixed(2),
    formattedExtrasSubtotal: extrasSubtotal.toFixed(2),
    formattedSubtotal: subtotal.toFixed(2),
    formattedTax: tax.toFixed(2),
    formattedServiceFee: serviceFee.toFixed(2),
    formattedGrandTotal: grandTotal.toFixed(2),
  };
}
