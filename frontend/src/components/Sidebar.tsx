import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Network,
  LogOut,
  Layers,
  FileText,
  Settings,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const { logout, user } = useAuth();
  const location = useLocation();

  const getLinks = () => {
    if (!user) return [];

    const dashboardLink = { to: '/', name: 'Dashboard', icon: LayoutDashboard };
    const employeesLink = { to: '/employees', name: 'Employees', icon: Users };
    const orgLink = { to: '/hierarchy', name: 'Organization', icon: Network };
    const reportsLink = { to: '/reports', name: 'Reports', icon: FileText };
    const deptsLink = { to: '/departments', name: 'Departments', icon: Layers };
    const settingsLink = { to: '/settings?tab=general', name: 'Settings', icon: Settings };
    const rolesLink = { to: '/settings?tab=permissions', name: 'Roles', icon: ShieldCheck };
    const managersLink = { to: '/employees?isManager=true', name: 'Managers', icon: UserCheck };

    if (user.role === 'Super Admin') {
      return [
        dashboardLink,
        employeesLink,
        deptsLink,
        orgLink,
        rolesLink,
        managersLink,
        reportsLink,
        settingsLink,
      ];
    } else if (user.role === 'HR Manager') {
      return [
        dashboardLink,
        employeesLink,
        orgLink,
        reportsLink,
      ];
    } else {
      return [
        dashboardLink,
        orgLink,
      ];
    }
  };

  const links = getLinks();

  return (
    <aside className="w-64 bg-white dark:bg-dark-card border-r border-gray-100 dark:border-dark-border h-screen sticky top-0 flex flex-col justify-between transition-all duration-300">
      <div className="py-4 px-5 border-b border-gray-50 dark:border-dark-border flex items-center gap-3">
        <div className="bg-blue-50 dark:bg-blue-950/40 p-2.5 rounded-xl text-[#2563EB] dark:text-blue-400 flex items-center justify-center shadow-sm">
          <Users className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-black text-base text-[#2563EB] dark:text-blue-400 tracking-wider leading-none">EMS</h1>
          <span className="text-[9px] text-[#64748B] dark:text-gray-455 font-bold uppercase tracking-wider">Management System</span>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto scrollbar-none">
        {links.map((link, idx) => {
          const Icon = link.icon;
          const isLinkActive = () => {
            const [toPath, toQuery] = link.to.split('?');
            const pathMatch = location.pathname === toPath;
            if (!pathMatch) return false;
            if (toQuery) {
              return location.search.includes(toQuery);
            } else {
              return !location.search.includes('isManager');
            }
          };

          return (
            <NavLink
              key={`${link.to}-${idx}`}
              to={link.to}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${isLinkActive()
                ? 'bg-blue-50 dark:bg-blue-950/45 text-[#2563EB] dark:text-blue-400 shadow-sm border border-blue-100/30 dark:border-blue-900/20'
                : 'text-[#64748B] dark:text-gray-400 hover:text-[#0F172A] dark:hover:text-white hover:bg-gray-50/50 dark:hover:bg-gray-800/40'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{link.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-3 border-t border-gray-50 dark:border-dark-border bg-gray-50/20 dark:bg-dark-bg/25">
        {user && (
          <div className="flex items-center gap-3 mb-3 px-2">
            {user.profileImage ? (
              <img
                src={user.profileImage}
                alt={user.name}
                className="w-9 h-9 rounded-full object-cover border border-gray-200 dark:border-dark-border"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-[#2563EB] dark:text-blue-400 font-bold text-sm">
                {user.name.charAt(0)}
              </div>
            )}
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate text-[#0F172A] dark:text-white">{user.name}</p>
              <p className="text-xs text-[#64748B] dark:text-gray-400 font-semibold truncate">{user.role}</p>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-[#DC2626] dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-200 cursor-pointer"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
