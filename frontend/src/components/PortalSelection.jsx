import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Building2,
  ShieldCheck,
  Users,
  Broom,
  ArrowRight,
} from 'lucide-react';

/**
 * PortalSelection — Role Login Screen
 * Three staff portals: Admin, Front Desk, Housekeeping.
 */
export default function PortalSelection() {
  const { switchRole } = useApp();

  const portals = [
    {
      role: 'ADMIN',
      title: 'Admin / Hotel Manager',
      description: 'Full system access — all modules, analytics, billing, rate management, and staff controls.',
      icon: ShieldCheck,
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      iconBg: 'bg-orange-500',
      textColor: 'text-orange-700',
    },
    {
      role: 'FRONT_DESK',
      title: 'Front Desk Agent',
      description: 'Dashboard, reservations, check-in/out workflows, and billing. Core day-to-day operations.',
      icon: Users,
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      iconBg: 'bg-blue-500',
      textColor: 'text-blue-700',
    },
    {
      role: 'HOUSEKEEPING',
      title: 'Housekeeping Staff',
      description: 'Simplified view of dirty and maintenance rooms with single-click "Mark Ready" task board.',
      icon: Broom,
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      iconBg: 'bg-emerald-500',
      textColor: 'text-emerald-700',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-orange-500 flex items-center justify-center shadow-sm">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-wide text-gray-900">AURA BOUTIQUE HOTEL</span>
            <p className="text-xs text-gray-400">Property Management System</p>
          </div>
          <div className="ml-auto">
            <span className="text-xs px-2.5 py-1 rounded-full bg-orange-50 text-orange-600 border border-orange-200 font-semibold">
              PMS v3.0
            </span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Select Your Portal</h1>
          <p className="text-gray-500 mt-2 text-sm max-w-md mx-auto">
            Choose your role to access the appropriate management view.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full max-w-4xl">
          {portals.map(portal => {
            const Icon = portal.icon;
            return (
              <button
                key={portal.role}
                onClick={() => switchRole(portal.role)}
                className={`text-left p-6 rounded-2xl border-2 ${portal.bg} ${portal.border} hover:shadow-lg hover:scale-[1.02] transition-all group`}
              >
                <div className={`w-12 h-12 rounded-xl ${portal.iconBg} flex items-center justify-center shadow-sm mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className={`text-base font-bold ${portal.textColor}`}>
                  {portal.title}
                </h3>
                <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                  {portal.description}
                </p>
                <div className={`mt-5 flex items-center gap-1 text-xs font-bold ${portal.textColor}`}>
                  <span>Enter Portal</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>
      </main>

      <footer className="border-t border-gray-200 py-4 text-center text-xs text-gray-400 bg-white">
        &copy; {new Date().getFullYear()} Aura Boutique Hotel — Property Management System
      </footer>
    </div>
  );
}
