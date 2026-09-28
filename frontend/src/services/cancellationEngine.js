export function calculateCancellationRefund(reservation, now = new Date()) {
  if (!reservation || !reservation.checkIn) {
    return { hoursUntilCheckIn: 0, refundPercentage: 0, penaltyPercentage: 100, refundAmount: 0, penaltyAmount: 0 };
  }

  const checkInDate = new Date(`${reservation.checkIn}T14:00:00Z`);
  const timeDiffMs = checkInDate.getTime() - now.getTime();
  const hoursUntilCheckIn = timeDiffMs / (1000 * 60 * 60);

  const totalPaid = (reservation.nights || 1) * (reservation.nightlyRate || 0);

  let refundPercentage = 0;
  let penaltyPercentage = 100;
  let policyTier = 'Tier 3 (<24h Lead Time)';

  if (hoursUntilCheckIn > 48) {
    refundPercentage = 100;
    penaltyPercentage = 0;
    policyTier = 'Tier 1 (>48h Lead Time - Full Refund)';
  } else if (hoursUntilCheckIn >= 24) {
    refundPercentage = 50;
    penaltyPercentage = 50;
    policyTier = 'Tier 2 (24-48h Lead Time - 50% Penalty)';
  } else {
    refundPercentage = 0;
    penaltyPercentage = 100;
    policyTier = 'Tier 3 (<24h Lead Time - Non-refundable)';
  }

  const refundAmount = (totalPaid * refundPercentage) / 100;
  const penaltyAmount = (totalPaid * penaltyPercentage) / 100;

  return {
    hoursUntilCheckIn: Math.round(hoursUntilCheckIn),
    refundPercentage,
    penaltyPercentage,
    totalPaid,
    refundAmount,
    penaltyAmount,
    policyTier,
    formattedRefundAmount: refundAmount.toFixed(2),
    formattedPenaltyAmount: penaltyAmount.toFixed(2),
    formattedTotalPaid: totalPaid.toFixed(2),
  };
}
