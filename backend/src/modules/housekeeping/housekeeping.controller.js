import db from '../../config/db.js';

export async function getHousekeepingTasks(req, res) {
  try {
    const { status } = req.query;

    let sql = `
      SELECT hk.*, r.room_number, r.floor_number, rt.name AS category_name
      FROM housekeeping_logs hk
      JOIN rooms r ON hk.room_id = r.id
      JOIN room_types rt ON r.room_type_id = rt.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      sql += ` AND hk.status = ?`;
      params.push(status);
    }

    sql += ` ORDER BY hk.id DESC`;

    const [rows] = await db.execute(sql, params);
    return res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function createHousekeepingTask(req, res) {
  try {
    const { room_id, task_type, assigned_staff_name, notes } = req.body;

    if (!room_id || !task_type) {
      return res.status(400).json({ success: false, error: 'room_id and task_type are required' });
    }

    const [result] = await db.execute(
      `INSERT INTO housekeeping_logs (room_id, task_type, status, assigned_staff_name, notes, reported_at)
       VALUES (?, ?, 'Pending', ?, ?, NOW())`,
      [Number(room_id), task_type, assigned_staff_name || null, notes || null]
    );

    // Update room status
    const targetRoomStatus = task_type === 'Repair/Maintenance' ? 'Maintenance' : 'Needs Cleaning';
    await db.execute(`UPDATE rooms SET status = ?, updated_at = NOW() WHERE id = ?`, [targetRoomStatus, Number(room_id)]);

    return res.status(201).json({
      success: true,
      message: `Housekeeping task logged for Room ID ${room_id}.`,
      taskId: result.insertId,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function completeHousekeepingTask(req, res) {
  try {
    const taskId = Number(req.params.id);

    const [rows] = await db.execute(
      `SELECT hk.id, hk.room_id, r.room_number
       FROM housekeeping_logs hk
       JOIN rooms r ON hk.room_id = r.id
       WHERE hk.id = ?`,
      [taskId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Housekeeping task not found' });
    }

    const task = rows[0];

    // Mark task completed
    await db.execute(`UPDATE housekeeping_logs SET status = 'Completed', completed_at = NOW() WHERE id = ?`, [taskId]);

    // Automatically release room status to Available
    await db.execute(`UPDATE rooms SET status = 'Available', updated_at = NOW() WHERE id = ?`, [task.room_id]);

    return res.json({
      success: true,
      message: `Task #${taskId} completed. Room ${task.room_number} status released to 'Available'.`,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
