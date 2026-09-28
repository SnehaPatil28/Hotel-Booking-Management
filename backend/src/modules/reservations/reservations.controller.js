import db from '../../config/db.js';

export async function createReservation(req, res) {
  let connection;
  try {
    const { guest_id, room_id, check_in_date, check_out_date, num_guests, booking_reference } = req.body;

    if (!guest_id || !room_id || !check_in_date || !check_out_date) {
      return res.status(400).json({ success: false, error: 'Missing required parameters' });
    }

    const d1 = new Date(check_in_date);
    const d2 = new Date(check_out_date);
    if (d2 <= d1) {
      return res.status(400).json({ success: false, error: 'check_out_date must be after check_in_date' });
    }

    const nights = Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24));
    const refCode = booking_reference || `RES-${Date.now().toString().slice(-6)}`;

    connection = await db.getConnection();
    await connection.beginTransaction();

    // 1. Lock room row FOR UPDATE
    const [roomRows] = await connection.execute(
      `SELECT r.id, r.room_number, COALESCE(r.custom_rate, rt.base_rate) AS active_rate
       FROM rooms r
       JOIN room_types rt ON r.room_type_id = rt.id
       WHERE r.id = ? AND r.is_active = 1
       FOR UPDATE`,
      [Number(room_id)]
    );

    if (roomRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, error: 'Room not found or inactive' });
    }

    const room = roomRows[0];
    const dailyRate = Number(room.active_rate);
    const totalAmount = nights * dailyRate;

    // 2. Strict overlap detection
    const [overlap] = await connection.execute(
      `SELECT COUNT(*) AS count
       FROM reservations
       WHERE room_id = ?
         AND status IN ('Confirmed', 'Checked-In')
         AND check_in_date < ?
         AND check_out_date > ?`,
      [room.id, check_out_date, check_in_date]
    );

    if (overlap[0].count > 0) {
      await connection.rollback();
      return res.status(409).json({
        success: false,
        error: 'Double booking conflict',
        message: `Room ${room.room_number} is already reserved for dates ${check_in_date} to ${check_out_date}.`,
      });
    }

    // 3. Create Reservation
    const [result] = await connection.execute(
      `INSERT INTO reservations (booking_reference, guest_id, room_id, check_in_date, check_out_date, num_guests, daily_rate, total_amount, status, payment_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Confirmed', 'Pending')`,
      [refCode, Number(guest_id), room.id, check_in_date, check_out_date, Number(num_guests) || 1, dailyRate, totalAmount]
    );

    await connection.commit();

    return res.status(201).json({
      success: true,
      data: {
        reservationId: result.insertId,
        bookingReference: refCode,
        roomId: room.id,
        roomNumber: room.room_number,
        nights,
        dailyRate,
        totalAmount,
        status: 'Confirmed',
      },
    });
  } catch (error) {
    if (connection) await connection.rollback();
    return res.status(500).json({ success: false, error: error.message });
  } finally {
    if (connection) connection.release();
  }
}

export async function getReservations(req, res) {
  try {
    const { status, guest_id, room_id } = req.query;

    let sql = `
      SELECT res.*, CONCAT(g.first_name, ' ', g.last_name) AS guest_name, g.email AS guest_email, r.room_number
      FROM reservations res
      JOIN guests g ON res.guest_id = g.id
      JOIN rooms r ON res.room_id = r.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      sql += ` AND res.status = ?`;
      params.push(status);
    }
    if (guest_id) {
      sql += ` AND res.guest_id = ?`;
      params.push(Number(guest_id));
    }
    if (room_id) {
      sql += ` AND res.room_id = ?`;
      params.push(Number(room_id));
    }

    sql += ` ORDER BY res.id DESC`;

    const [rows] = await db.execute(sql, params);
    return res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
