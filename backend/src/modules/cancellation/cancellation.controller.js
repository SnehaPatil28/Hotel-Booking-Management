import db from '../../config/db.js';

export async function cancelReservation(req, res) {
  let connection;
  try {
    const reservationId = Number(req.params.id);

    connection = await db.getConnection();
    await connection.beginTransaction();

    const [rows] = await connection.execute(
      `SELECT res.*, r.room_number
       FROM reservations res
       JOIN rooms r ON res.room_id = r.id
       WHERE res.id = ? FOR UPDATE`,
      [reservationId]
    );

    if (rows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, error: 'Reservation not found' });
    }

    const reservation = rows[0];
    if (reservation.status === 'Cancelled' || reservation.status === 'Checked-Out') {
      await connection.rollback();
      return res.status(400).json({ success: false, error: `Cannot cancel reservation in state '${reservation.status}'` });
    }

    // Lead time calculation
    const checkInDateTime = new Date(`${reservation.check_in_date}T14:00:00Z`);
    const now = new Date();
    const hoursUntilCheckIn = (checkInDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    const totalPaid = Number(reservation.total_amount);
    let refundPct = 0;
    let penaltyPct = 100;

    if (hoursUntilCheckIn > 48) {
      refundPct = 100;
      penaltyPct = 0;
    } else if (hoursUntilCheckIn >= 24) {
      refundPct = 50;
      penaltyPct = 50;
    } else {
      refundPct = 0;
      penaltyPct = 100;
    }

    const refundAmount = (totalPaid * refundPct) / 100;
    const penaltyAmount = (totalPaid * penaltyPct) / 100;

    // Update reservation
    await connection.execute(
      `UPDATE reservations
       SET status = 'Cancelled', payment_status = ?, cancellation_penalty = ?, refund_amount = ?, updated_at = NOW()
       WHERE id = ?`,
      [refundPct === 100 ? 'Refunded' : 'Partially_Paid', penaltyAmount, refundAmount, reservationId]
    );

    // Instant Room Re-release back to Available
    await connection.execute(`UPDATE rooms SET status = 'Available', updated_at = NOW() WHERE id = ?`, [reservation.room_id]);

    await connection.commit();

    return res.json({
      success: true,
      message: `Reservation #${reservationId} cancelled. Refund: $${refundAmount.toFixed(2)} (${refundPct}%). Room ${reservation.room_number} re-released.`,
      data: {
        reservationId,
        leadTimeHours: Math.round(hoursUntilCheckIn),
        refundPercentage: refundPct,
        penaltyPercentage: penaltyPct,
        refundAmount: refundAmount.toFixed(2),
        penaltyAmount: penaltyAmount.toFixed(2),
        roomReReleased: reservation.room_number,
      },
    });
  } catch (error) {
    if (connection) await connection.rollback();
    return res.status(500).json({ success: false, error: error.message });
  } finally {
    if (connection) connection.release();
  }
}
