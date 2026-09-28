import db from '../../config/db.js';

export async function expressCheckIn(req, res) {
  let connection;
  try {
    const reservationId = Number(req.params.id);

    connection = await db.getConnection();
    await connection.beginTransaction();

    const [rows] = await connection.execute(
      `SELECT res.id, res.room_id, res.status, r.room_number
       FROM reservations res
       JOIN rooms r ON res.room_id = r.id
       WHERE res.id = ? FOR UPDATE`,
      [reservationId]
    );

    if (rows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, error: 'Reservation not found' });
    }

    const resItem = rows[0];
    if (resItem.status !== 'Confirmed') {
      await connection.rollback();
      return res.status(400).json({ success: false, error: `Cannot check in reservation with status '${resItem.status}'` });
    }

    // Update reservation -> Checked-In
    await connection.execute(`UPDATE reservations SET status = 'Checked-In', updated_at = NOW() WHERE id = ?`, [reservationId]);

    // Update room -> Occupied
    await connection.execute(`UPDATE rooms SET status = 'Occupied', updated_at = NOW() WHERE id = ?`, [resItem.room_id]);

    await connection.commit();

    return res.json({
      success: true,
      message: `Checked in guest for Reservation #${reservationId}. Room ${resItem.room_number} is now 'Occupied'.`,
    });
  } catch (error) {
    if (connection) await connection.rollback();
    return res.status(500).json({ success: false, error: error.message });
  } finally {
    if (connection) connection.release();
  }
}

export async function expressCheckOut(req, res) {
  let connection;
  try {
    const reservationId = Number(req.params.id);

    connection = await db.getConnection();
    await connection.beginTransaction();

    const [rows] = await connection.execute(
      `SELECT res.id, res.room_id, res.status, r.room_number, CONCAT(g.first_name, ' ', g.last_name) AS guest_name
       FROM reservations res
       JOIN rooms r ON res.room_id = r.id
       JOIN guests g ON res.guest_id = g.id
       WHERE res.id = ? FOR UPDATE`,
      [reservationId]
    );

    if (rows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, error: 'Reservation not found' });
    }

    const resItem = rows[0];
    if (resItem.status !== 'Checked-In') {
      await connection.rollback();
      return res.status(400).json({ success: false, error: `Cannot check out reservation with status '${resItem.status}'` });
    }

    // Update reservation -> Checked-Out & Paid
    await connection.execute(`UPDATE reservations SET status = 'Checked-Out', payment_status = 'Paid', updated_at = NOW() WHERE id = ?`, [reservationId]);

    // Automatically transition room -> Needs Cleaning
    await connection.execute(`UPDATE rooms SET status = 'Needs Cleaning', updated_at = NOW() WHERE id = ?`, [resItem.room_id]);

    // Insert housekeeping turn-down log
    await connection.execute(
      `INSERT INTO housekeeping_logs (room_id, task_type, status, assigned_staff_name, notes)
       VALUES (?, 'Turn Down', 'Pending', 'Housekeeping Staff', ?)`,
      [resItem.room_id, `Check-out cleaning for guest ${resItem.guest_name}`]
    );

    await connection.commit();

    return res.json({
      success: true,
      message: `Checked out guest for Reservation #${reservationId}. Room ${resItem.room_number} state set to 'Needs Cleaning'.`,
    });
  } catch (error) {
    if (connection) await connection.rollback();
    return res.status(500).json({ success: false, error: error.message });
  } finally {
    if (connection) connection.release();
  }
}
