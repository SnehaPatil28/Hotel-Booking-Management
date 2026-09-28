import React from 'react';
import { useApp } from '../context/AppContext';

export default function RoleGuard({ allowedRoles = [], children, fallback = null }) {
  const { userRole } = useApp();

  if (!allowedRoles.includes(userRole)) {
    return fallback;
  }

  return <>{children}</>;
}
