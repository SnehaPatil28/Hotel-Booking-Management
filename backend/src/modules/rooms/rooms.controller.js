import db from '../../config/db.js';

export async function getRooms(req, res) {
  try {
    const { status, floor_number, room_type_id } = req.query;

    let sql = `
      SELECT 
        r.id, r.room_number, r.floor_number, r.status, r.custom_rate, r.is_active,
        rt.id AS room_type_id, rt.name AS category_name, rt.base_rate, rt.max_capacity,
        COALESCE(r.custom_rate, rt.base_rate) AS effective_rate
      FROM rooms r
      JOIN room_types rt ON r.room_type_id = rt.id
      WHERE r.is_active = 1
    `;
    const params = [];

    if (status) {
      sql += ` AND r.status = ?`;
      params.push(status);
    }
    if (floor_number) {
      sql += ` AND r.floor_number = ?`;
      params.push(Number(floor_number));
    }
    if (room_type_id) {
      sql += ` AND r.room_type_id = ?`;
      params.push(Number(room_type_id));
    }

    sql += ` ORDER BY r.floor_number ASC, r.room_number ASC`;

    const [rows] = await db.execute(sql, params);
    return res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function updateRoomStatus(req, res) {
  try {
    const roomId = Number(req.params.id);
    const { status } = req.body;

    const validStatuses = ['Available', 'Occupied', 'Needs Cleaning', 'Maintenance'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    await db.execute('UPDATE rooms SET status = ?, updated_at = NOW() WHERE id = ?', [status, roomId]);
    return res.json({ success: true, message: `Room ${roomId} status updated to '${status}'.` });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
