import db from '../../config/db.js';

export async function addExtraCharge(req, res) {
  try {
    const { reservation_id, category, description, amount } = req.body;

    if (!reservation_id || !category || !amount) {
      return res.status(400).json({ success: false, error: 'reservation_id, category, and amount are required' });
    }

    const [result] = await db.execute(
      `INSERT INTO extra_charges (reservation_id, category, description, amount, posted_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [Number(reservation_id), category, description || category, Number(amount)]
    );

    return res.status(201).json({
      success: true,
      message: `Posted ${category} charge ($${amount}) to Reservation #${reservation_id}`,
      chargeId: result.insertId,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function getInvoice(req, res) {
  try {
    const reservationId = Number(req.params.reservationId);

    // Fetch reservation details
    const [resRows] = await db.execute(
      `SELECT res.*, CONCAT(g.first_name, ' ', g.last_name) AS guest_name, g.email AS guest_email, r.room_number
       FROM reservations res
       JOIN guests g ON res.guest_id = g.id
       JOIN rooms r ON res.room_id = r.id
       WHERE res.id = ?`,
      [reservationId]
    );

    if (resRows.length === 0) {
      return res.status(404).json({ success: false, error: 'Reservation not found' });
    }

    const reservation = resRows[0];

    // Fetch extra charges
    const [charges] = await db.execute(
      `SELECT * FROM extra_charges WHERE reservation_id = ? ORDER BY posted_at ASC`,
      [reservationId]
    );

    const roomSubtotal = Number(reservation.total_amount);
    const extrasSubtotal = charges.reduce((sum, c) => sum + Number(c.amount), 0);
    const subtotal = roomSubtotal + extrasSubtotal;

    const taxAmount = subtotal * 0.12; // 12% Local Occupancy Tax
    const serviceFee = subtotal * 0.05; // 5% Service Fee
    const grandTotal = subtotal + taxAmount + serviceFee;

    return res.json({
      success: true,
      data: {
        invoiceNumber: `INV-${reservationId}-${Date.now().toString().slice(-4)}`,
        reservationId,
        guestName: reservation.guest_name,
        guestEmail: reservation.guest_email,
        roomNumber: reservation.room_number,
        dates: { checkIn: reservation.check_in_date, checkOut: reservation.check_out_date },
        breakdown: {
          roomSubtotal: roomSubtotal.toFixed(2),
          extrasSubtotal: extrasSubtotal.toFixed(2),
          subtotal: subtotal.toFixed(2),
          taxAmount: taxAmount.toFixed(2),
          serviceFee: serviceFee.toFixed(2),
          grandTotal: grandTotal.toFixed(2),
        },
        extraCharges: charges,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
