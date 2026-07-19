import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Sun, Moon, Bell, Search, ChevronDown, User, Power, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  title: string;
  onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, onMenuClick }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchVal, setSearchVal] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'New Employee Onboarded',
      desc: 'Alex Reed joined the Engineering team.',
      time: '2 hours ago',
      read: false,
    },
    {
      id: 2,
      title: 'Security Policy Enforced',
      desc: 'MFA configuration settings updated by Admin.',
      time: '1 day ago',
      read: false,
    },
    {
      id: 3,
      title: 'Work Anniversary',
      desc: 'Rahul Gurudu celebrates 2 years at EMS!',
      time: '3 days ago',
      read: true,
    }
  ]);

  const hasUnread = notifications.some(n => !n.read);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const toggleRead = (id: number) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: !n.read } : n));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchVal.trim().toLowerCase();
    if (!query) return;

    if (query.includes('dash')) {
      navigate('/');
    } else if (query.includes('employ') || query.includes('emply')) {
      navigate('/employees');
    } else if (query.includes('depart') || query.includes('dept')) {
      navigate('/departments');
    } else if (query.includes('organi') || query.includes('orgain') || query === 'org' || query.includes('hier')) {
      navigate('/hierarchy');
    } else if (query === 'roles' || query === 'role' || query.includes('permis')) {
      navigate('/settings?tab=permissions');
    } else if (query.includes('manag') || query.includes('manger')) {
      navigate('/employees?isManager=true');
    } else if (query.includes('report')) {
      navigate('/reports');
    } else if (query.includes('sett')) {
      navigate('/settings?tab=general');
    } else if (query.includes('profil')) {
      navigate('/profile');
    } else {
      navigate(`/employees?search=${encodeURIComponent(searchVal.trim())}`);
    }
    setSearchVal('');
  };

  return (
    <header className="h-20 bg-white dark:bg-dark-card border-b border-gray-200 dark:border-dark-border px-4 md:px-8 flex items-center justify-between transition-all duration-300">
      <div className="flex items-center gap-4 md:gap-8 flex-1">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all cursor-pointer mr-1"
          title="Open Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-sm font-extrabold text-gray-800 dark:text-white uppercase tracking-wider">{title}</h2>
        </div>
        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-xs hidden md:block">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search anything..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full bg-[#F8FAFC] dark:bg-dark-bg border border-[#E5E7EB] dark:border-dark-border rounded-xl py-2 pl-9 pr-4 text-xs font-semibold text-gray-700 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all"
          />
        </form>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl border border-[#E5E7EB] dark:border-dark-border text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all cursor-pointer"
          title="Toggle Theme"
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>

        <div className="relative">
          <button
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setDropdownOpen(false);
            }}
            className="p-2 rounded-xl border border-[#E5E7EB] dark:border-dark-border text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all relative cursor-pointer focus:outline-none"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {hasUnread && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#2563EB] rounded-full border border-white dark:border-dark-card animate-pulse"></span>
            )}
          </button>

          {notificationsOpen && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setNotificationsOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-dark-card border border-gray-150 dark:border-dark-border rounded-2xl shadow-xl z-20 overflow-hidden transition-all duration-200">
                <div className="px-4 py-3 bg-gray-50/50 dark:bg-dark-bg/25 border-b border-gray-100 dark:border-dark-border flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-800 dark:text-white">Notifications</span>
                  {hasUnread && (
                    <button 
                      onClick={markAllAsRead}
                      className="text-[10px] font-extrabold text-[#2563EB] dark:text-blue-400 hover:underline bg-transparent border-none cursor-pointer"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-gray-50 dark:divide-dark-border/40">
                  {notifications.map((n) => (
                    <div 
                      key={n.id}
                      onClick={() => toggleRead(n.id)}
                      className={`p-3.5 hover:bg-gray-50/70 dark:hover:bg-gray-850/30 transition-all cursor-pointer relative ${
                        !n.read ? 'bg-blue-50/20 dark:bg-blue-950/10' : ''
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        {!n.read && (
                          <span className="w-2 h-2 rounded-full bg-[#2563EB] dark:bg-blue-400 mt-1.5 shrink-0" />
                        )}
                        <div className="flex-1 space-y-0.5">
                          <p className={`text-xs text-gray-800 dark:text-gray-250 ${!n.read ? 'font-bold' : 'font-medium'}`}>
                            {n.title}
                          </p>
                          <p className="text-[11px] text-gray-500 dark:text-gray-450 leading-snug">
                            {n.desc}
                          </p>
                          <p className="text-[9px] text-gray-400 dark:text-gray-500">
                            {n.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-2.5 bg-gray-50/50 dark:bg-dark-bg/25 border-t border-gray-100 dark:border-dark-border text-center">
                  <button 
                    onClick={() => setNotificationsOpen(false)}
                    className="text-[10px] font-bold text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-250 bg-transparent border-none cursor-pointer"
                  >
                    Close Panel
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="w-px h-6 bg-gray-200 dark:bg-dark-border mx-1"></div>

        {user && (
          <div className="relative">
            <button
              onClick={() => {
                setDropdownOpen(!dropdownOpen);
                setNotificationsOpen(false);
              }}
              className="flex items-center gap-3 cursor-pointer group focus:outline-none"
            >
              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover border border-[#E5E7EB] dark:border-dark-border group-hover:border-[#2563EB] transition-colors"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-[#2563EB] dark:text-blue-400 font-bold border border-blue-100 group-hover:border-[#2563EB] transition-colors text-sm">
                  {user.name.charAt(0)}
                </div>
              )}
              <div className="text-left hidden sm:block">
                <p className="text-sm font-bold text-gray-800 dark:text-white group-hover:text-[#2563EB] transition-colors leading-tight">{user.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight mt-0.5">{user.email}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors ml-1" />
            </button>

            {dropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-dark-card border border-gray-150 dark:border-dark-border rounded-2xl shadow-xl py-1.5 z-20 transition-all duration-200">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate('/profile');
                    }}
                    className="w-full text-left px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-[#2563EB] dark:hover:text-blue-400 flex items-center gap-3 cursor-pointer border-none"
                  >
                    <User className="w-4 h-4 text-[#2563EB] dark:text-blue-400" />
                    <span>Profile</span>
                  </button>
                  <div className="border-t border-gray-100 dark:border-dark-border my-0.5"></div>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-4 py-3 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center gap-3 cursor-pointer border-none"
                  >
                    <Power className="w-4 h-4 text-red-600 dark:text-red-400" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
