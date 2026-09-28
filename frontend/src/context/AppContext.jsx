import React, { createContext, useContext, useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { calculateCancellationRefund } from '../services/cancellationEngine';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [userRole, setUserRole] = useState(() => storageService.getUserRole());
  const [rooms, setRooms] = useState(() => storageService.getRooms());
  const [reservations, setReservations] = useState(() => storageService.getReservations());
  const [billingItems, setBillingItems] = useState(() => storageService.getBillingItems());
  const [housekeepingTasks, setHousekeepingTasks] = useState(() => storageService.getHousekeepingTasks());
  const [logs, setLogs] = useState(() => storageService.getLogs());

  useEffect(() => { storageService.saveRooms(rooms); }, [rooms]);
  useEffect(() => { storageService.saveReservations(reservations); }, [reservations]);
  useEffect(() => { storageService.saveBillingItems(billingItems); }, [billingItems]);
  useEffect(() => { storageService.saveHousekeepingTasks(housekeepingTasks); }, [housekeepingTasks]);
  useEffect(() => { storageService.saveLogs(logs); }, [logs]);

  const addLog = (type, text) => {
    const newLog = {
      id: `l-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type,
      text,
    };
    setLogs(prev => [newLog, ...prev]);
  };

  const switchRole = (newRole) => {
    setUserRole(newRole);
    addLog('ROLE_SWITCH', `Active portal switched to ${newRole || 'PORTAL_SELECTION'}`);
  };

  const resetDemoData = () => {
    const res = storageService.resetAll();
    setRooms(res.rooms);
    setReservations(res.reservations);
    setBillingItems(res.billingItems);
    setHousekeepingTasks(res.housekeepingTasks);
    setLogs(res.logs);
    setUserRole(res.role);
    addLog('SYSTEM_RESET', 'System data restored to default initial state.');
  };

  const updateRoomStatus = (roomIdOrNumber, status) => {
    setRooms(prev => prev.map(r => {
      if (r.id === roomIdOrNumber || r.number === roomIdOrNumber) {
        return {
          ...r,
          status,
          ...(status !== 'Maintenance' ? { maintenanceNote: '' } : {}),
        };
      }
      return r;
    }));
    addLog('ROOM_UPDATE', `Room ${roomIdOrNumber} status updated to '${status}'.`);
  };

  const updateRoomDetails = (roomId, updatedFields) => {
    setRooms(prev => prev.map(r => r.id === roomId ? { ...r, ...updatedFields } : r));
    addLog('ROOM_EDIT', `Room ${updatedFields.number || roomId} details updated.`);
  };

  const setRoomMaintenance = (roomIdOrNumber, note) => {
    const target = rooms.find(r => r.id === roomIdOrNumber || r.number === roomIdOrNumber);
    if (!target) return;
    setRooms(prev => prev.map(r => r.id === target.id ? { ...r, status: 'Maintenance', maintenanceNote: note } : r));
    addLog('MAINTENANCE', `Room ${target.number} placed under Maintenance: "${note}".`);
  };

  const clearRoomMaintenance = (roomIdOrNumber) => {
    const target = rooms.find(r => r.id === roomIdOrNumber || r.number === roomIdOrNumber);
    if (!target) return;
    setRooms(prev => prev.map(r => r.id === target.id ? { ...r, status: 'Available', maintenanceNote: '' } : r));
    addLog('MAINTENANCE_CLEAR', `Room ${target.number} maintenance cleared. Status set to 'Available'.`);
  };

  const createReservation = (bookingData) => {
    const targetRoom = rooms.find(r => r.id === bookingData.roomId || r.number === bookingData.roomNumber);
    const newRes = {
      id: `res-${Date.now().toString().slice(-4)}`,
      status: 'Confirmed',
      paymentStatus: 'Pending',
      createdAt: new Date().toISOString(),
      ...bookingData,
      roomId: targetRoom?.id || bookingData.roomId,
      roomNumber: targetRoom?.number || bookingData.roomNumber,
    };
    setReservations(prev => [newRes, ...prev]);
    addLog('RESERVATION', `New booking for ${newRes.guestName} in Room ${newRes.roomNumber} (${newRes.nights} nights).`);
    return newRes;
  };

  const performCheckIn = (reservationId) => {
    const res = reservations.find(r => r.id === reservationId);
    if (!res) return;
    setReservations(prev => prev.map(r => r.id === reservationId ? { ...r, status: 'Checked-In' } : r));
    const targetRoom = rooms.find(r => r.id === res.roomId || r.number === res.roomNumber);
    if (targetRoom) updateRoomStatus(targetRoom.id, 'Occupied');
    addLog('CHECK_IN', `Check-In completed for ${res.guestName} (Room ${res.roomNumber}). Room set to 'Occupied'.`);
  };

  const performCheckOut = (reservationId) => {
    const res = reservations.find(r => r.id === reservationId);
    if (!res) return;
    setReservations(prev => prev.map(r => r.id === reservationId ? { ...r, status: 'Checked-Out', paymentStatus: 'Paid' } : r));
    const targetRoom = rooms.find(r => r.id === res.roomId || r.number === res.roomNumber);
    if (targetRoom) {
      updateRoomStatus(targetRoom.id, 'Needs Cleaning');
      const newTask = {
        id: `hk-${Date.now()}`,
        roomNumber: targetRoom.number,
        floor: targetRoom.floor || '1st Floor',
        category: targetRoom.category || 'Standard',
        priority: 'High',
        type: 'Turn-Down',
        status: 'Pending',
        assignedTo: 'Housekeeping Staff',
        note: `Check-out turn-down for ${res.guestName}`,
      };
      setHousekeepingTasks(prev => [newTask, ...prev]);
    }
    addLog('CHECK_OUT', `Check-Out completed for ${res.guestName} (Room ${res.roomNumber}). Room set to 'Needs Cleaning'.`);
  };

  const cancelReservation = (reservationId) => {
    const res = reservations.find(r => r.id === reservationId);
    if (!res) return;
    const refundCalc = calculateCancellationRefund(res);
    setReservations(prev => prev.map(r => r.id === reservationId ? { ...r, status: 'Cancelled', cancellationDetails: refundCalc } : r));
    const room = rooms.find(r => r.id === res.roomId || r.number === res.roomNumber);
    if (room && (room.status === 'Occupied' || room.status === 'Needs Cleaning')) {
      updateRoomStatus(room.id, 'Available');
    }
    addLog('CANCEL', `Reservation ${res.id} cancelled. Refund: ${refundCalc.formattedRefundAmount} (${refundCalc.refundPercentage}%). Room ${res.roomNumber} re-released.`);
    return refundCalc;
  };

  const addBillingItem = (item) => {
    const newItem = { id: `b-${Date.now()}`, timestamp: new Date().toISOString(), ...item };
    setBillingItems(prev => [newItem, ...prev]);
    addLog('BILLING', `Added ${item.category} ($${item.amount}) to Room ${item.roomNumber} ledger.`);
  };

  const markRoomClean = (roomNumber) => {
    const targetRoom = rooms.find(r => r.number === roomNumber || r.id === roomNumber);
    if (targetRoom) updateRoomStatus(targetRoom.id, 'Available');
    setHousekeepingTasks(prev => prev.map(t => t.roomNumber === (targetRoom?.number || roomNumber) ? { ...t, status: 'Completed' } : t));
    addLog('HOUSEKEEPING', `Room ${targetRoom?.number || roomNumber} cleaned and set to 'Available'.`);
  };

  return (
    <AppContext.Provider
      value={{
        userRole,
        switchRole,
        rooms,
        reservations,
        billingItems,
        housekeepingTasks,
        logs,
        resetDemoData,
        updateRoomStatus,
        updateRoomDetails,
        setRoomMaintenance,
        clearRoomMaintenance,
        createReservation,
        performCheckIn,
        performCheckOut,
        cancelReservation,
        addBillingItem,
        markRoomClean,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
