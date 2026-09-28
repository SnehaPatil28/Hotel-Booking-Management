import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Building2, 
  RotateCcw, 
  Clock, 
  ShieldCheck, 
  LayoutDashboard,
  BedDouble,
  CalendarCheck,
  Receipt,
  Broom,
  LogOut,
  SlidersHorizontal
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onSwitchPortal }) {
  const { userRole, switchRole, resetDemoData } = useApp();
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const roleLabels = {
    ADMIN: 'Admin / Manager',
    FRONT_DESK: 'Front Desk Agent',
    HOUSEKEEPING: 'Housekeeping Staff',
    GUEST: 'Guest Portal',
  };

  const navTabs = [
    { id: 'dashboard',     label: 'Dashboard',     icon: LayoutDashboard, roles: ['ADMIN', 'FRONT_DESK', 'HOUSEKEEPING'] },
    { id: 'rooms',         label: 'Rooms Grid',    icon: BedDouble,       roles: ['ADMIN', 'FRONT_DESK', 'HOUSEKEEPING'] },
    { id: 'reservations',  label: 'Reservations',   icon: CalendarCheck,   roles: ['ADMIN', 'FRONT_DESK'] },
    { id: 'billing',       label: 'Billing',        icon: Receipt,         roles: ['ADMIN', 'FRONT_DESK'] },
    { id: 'housekeeping',  label: 'Housekeeping',   icon: Broom,           roles: ['ADMIN', 'HOUSEKEEPING'] },
  ];

  const roleColors = {
    ADMIN:        'bg-orange-100 text-orange-700 border-orange-200',
    FRONT_DESK:   'bg-blue-100 text-blue-700 border-blue-200',
    HOUSEKEEPING: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    GUEST:        'bg-purple-100 text-purple-700 border-purple-200',
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-orange-500 flex items-center justify-center shadow-sm">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-wide text-gray-900">
                  AURA BOUTIQUE
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 border border-orange-200 font-medium">
                  PMS v3.0
                </span>
              </div>
              <p className="text-xs text-gray-400 font-medium">Hotel Property Management System</p>
            </div>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-3">
            {/* Clock */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-xs text-gray-500">
              <Clock className="w-3.5 h-3.5 text-orange-500" />
              <span className="font-mono">{currentTime}</span>
            </div>

            {/* Role indicator badge */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold ${roleColors[userRole] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
              <ShieldCheck className="w-3.5 h-3.5 hidden sm:block" />
              <span>{roleLabels[userRole] || userRole}</span>
            </div>

            {/* Switch Portal Button */}
            <button
              onClick={onSwitchPortal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white transition-all shadow-sm"
              title="Switch Role or Portal"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Switch Portal</span>
            </button>

            {/* Reset demo */}
            <button
              onClick={() => {
                if (window.confirm('Reset all PMS data back to default initial state?')) {
                  resetDemoData();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 transition-all border border-gray-200"
              title="Reset Demo Data to Default State"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Reset Demo</span>
            </button>
          </div>
        </div>

        {/* Nav tabs */}
        <nav className="flex space-x-1 overflow-x-auto pb-2 border-t border-gray-100 pt-2 scrollbar-none">
          {navTabs
            .filter(tab => tab.roles.includes(userRole))
            .map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
        </nav>

      </div>
    </header>
  );
}
