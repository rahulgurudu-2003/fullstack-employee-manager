import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  UserCheck,
  UserX,
  Layers,
  TrendingUp,
  Activity,
  ArrowRight,
  Calendar,
  Clock,
  UserCircle
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';
import { Link } from 'react-router-dom';

interface DashboardStats {
  total: number;
  active: number;
  inactive: number;
  departmentCount: number;
  deptDistribution: { name: string; value: number }[];
  roleDistribution: { name: string; value: number }[];
  statusDistribution: { name: string; value: number }[];
}

const COLORS = ['#2563EB', '#64748B', '#16A34A', '#EA580C', '#DC2626', '#8B5CF6'];
const STATUS_COLORS = ['#16A34A', '#DC2626'];

const Dashboard: React.FC = () => {
  const { token, user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentEmployees, setRecentEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsResponse = await fetch('/api/organization/stats', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const recentResponse = await fetch('/api/employees?limit=5&sortBy=createdAt&sortOrder=desc', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (statsResponse.ok) {
          const statsResult = await statsResponse.json();
          setStats(statsResult.data);
        }
        if (recentResponse.ok) {
          const recentResult = await recentResponse.json();
          setRecentEmployees(recentResult.data.employees || []);
        }
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchData();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] bg-[#F8FAFC] dark:bg-dark-bg">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (user?.role === 'Employee') {
    const joinDate = user.joiningDate ? new Date(user.joiningDate) : new Date();
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - joinDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const experienceText = diffDays > 30 
      ? `${Math.floor(diffDays / 30)} Months` 
      : `${diffDays} Days`;

    return (
      <div className="p-8 space-y-6 max-w-7xl mx-auto bg-[#F8FAFC] dark:bg-dark-bg transition-colors duration-300">
        <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-xl p-6 shadow-sm flex items-center justify-between transition-colors duration-300">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white">Welcome {user.name} 👋</h1>
            <p className="text-xs text-[#64748B] dark:text-gray-400 font-semibold uppercase tracking-wider">Employee Portal</p>
          </div>
          <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-green-50 dark:bg-green-950/20 text-[#16A34A] dark:text-green-400 border border-green-100 dark:border-green-900/30">
            🟢 {user.status} Account
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-xl p-8 shadow-sm space-y-6 transition-colors duration-300">
            <h3 className="text-lg font-bold text-[#0F172A] dark:text-white border-b border-gray-50 dark:border-dark-border pb-3">Profile Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-[#64748B] dark:text-gray-400">Employee ID</span>
                <p className="font-bold text-[#0F172A] dark:text-white">{user.employeeId}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-semibold text-[#64748B] dark:text-gray-400">Department</span>
                <p className="font-bold text-[#0F172A] dark:text-white">{user.department}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-semibold text-[#64748B] dark:text-gray-400">Designation</span>
                <p className="font-bold text-[#0F172A] dark:text-white">{user.designation}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-semibold text-[#64748B] dark:text-gray-400">Reporting Manager</span>
                <p className="font-bold text-[#0F172A] dark:text-white">
                  {user.reportingManager ? user.reportingManager.name : 'No reporting manager assigned'}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-semibold text-[#64748B] dark:text-gray-400">Joining Date</span>
                <p className="font-bold text-[#0F172A] dark:text-white">
                  {user.joiningDate ? new Date(user.joiningDate).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-semibold text-[#64748B] dark:text-gray-400">Registered Email</span>
                <p className="font-bold text-[#0F172A] dark:text-white">{user.email}</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-xl p-6 shadow-sm flex items-center gap-4 transition-colors duration-300">
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-[#2563EB] dark:text-blue-400 rounded-xl">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-semibold text-[#64748B] dark:text-gray-400">Experience tenure</span>
                <h4 className="text-xl font-bold text-[#0F172A] dark:text-white">{experienceText}</h4>
              </div>
            </div>

            <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-xl p-6 shadow-sm flex items-center gap-4 transition-colors duration-300">
              <div className="p-3 bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 rounded-xl">
                <UserCircle className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-semibold text-[#64748B] dark:text-gray-400">Manager's Title</span>
                <h4 className="text-sm font-bold text-[#0F172A] dark:text-white">
                  {user.reportingManager ? user.reportingManager.designation : 'N/A'}
                </h4>
              </div>
            </div>

            <Link 
              to="/profile"
              className="block bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-xl p-6 shadow-sm space-y-3 transition-all duration-300 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-900 group cursor-pointer"
            >
              <div className="flex justify-between items-center text-xs font-semibold text-[#64748B] dark:text-gray-400">
                <span className="group-hover:text-[#2563EB] transition-colors">Profile Completion</span>
                <span className="text-[#2563EB] dark:text-blue-450 font-bold">85%</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                <div className="bg-[#2563EB] h-full rounded-full" style={{ width: '85%' }}></div>
              </div>
              <p className="text-[10px] text-[#64748B] dark:text-gray-400 group-hover:text-gray-650 dark:group-hover:text-gray-300 transition-colors">Add a profile photo or update contact fields to reach 100%.</p>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isHR = user?.role === 'HR Manager';

  const statCards = isHR
    ? [
        {
          title: 'Total Employees',
          value: stats?.total || 0,
          icon: Users,
          color: 'text-blue-600',
          bg: 'bg-blue-50',
          to: '/employees',
        },
        {
          title: "Today's Joinings",
          value: recentEmployees.filter(emp => {
            const jd = new Date(emp.joiningDate);
            const today = new Date();
            return jd.toDateString() === today.toDateString();
          }).length || 0,
          icon: Calendar,
          color: 'text-[#16A34A]',
          bg: 'bg-green-50',
          to: '/employees',
        },
        {
          title: 'Pending Profiles',
          value: recentEmployees.filter(emp => !emp.profileImage).length || 0,
          icon: Clock,
          color: 'text-[#EA580C]',
          bg: 'bg-orange-50',
          to: '/employees',
        },
        {
          title: 'Departments Count',
          value: stats?.departmentCount || 0,
          icon: Layers,
          color: 'text-[#64748B]',
          bg: 'bg-slate-50',
          to: '/departments',
        },
      ]
    : [
        {
          title: 'Total Employees',
          value: stats?.total || 0,
          icon: Users,
          color: 'text-[#2563EB]',
          bg: 'bg-blue-50',
          to: '/employees',
        },
        {
          title: 'Active Employees',
          value: stats?.active || 0,
          icon: UserCheck,
          color: 'text-[#16A34A]',
          bg: 'bg-green-50',
          to: '/employees?status=Active',
        },
        {
          title: 'Inactive Accounts',
          value: stats?.inactive || 0,
          icon: UserX,
          color: 'text-[#DC2626]',
          bg: 'bg-red-50',
          to: '/employees?status=Inactive',
        },
        {
          title: 'Departments',
          value: stats?.departmentCount || 0,
          icon: Layers,
          color: 'text-[#64748B]',
          bg: 'bg-slate-50',
          to: '/departments',
        },
      ];

  const getIconStyles = (bg: string) => {
    if (bg.includes('blue')) return 'bg-blue-50 dark:bg-blue-950/40 text-[#2563EB] dark:text-blue-400';
    if (bg.includes('green')) return 'bg-green-50 dark:bg-green-950/40 text-[#16A34A] dark:text-green-400';
    if (bg.includes('red')) return 'bg-red-50 dark:bg-red-950/40 text-[#DC2626] dark:text-red-400';
    if (bg.includes('orange') || bg.includes('org')) return 'bg-orange-50 dark:bg-orange-950/40 text-[#EA580C] dark:text-orange-400';
    return 'bg-slate-50 dark:bg-slate-800 text-[#64748B] dark:text-gray-400';
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto bg-transparent transition-colors duration-300">
      <div className="flex justify-between items-center pb-2">
        <div>
          <h1 className="text-[32px] font-bold text-[#0F172A] dark:text-white tracking-tight leading-none">Dashboard</h1>
          <p className="text-[24px] font-medium text-[#64748B] dark:text-gray-400 mt-2">Welcome Back, {user?.name} 👋</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <Link
              key={i}
              to={card.to}
              className="bg-white dark:bg-dark-card border border-[#E5E7EB] dark:border-dark-border rounded-2xl p-6 flex items-center justify-between shadow-sm transition-all duration-300 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-900 group cursor-pointer"
            >
              <div className="space-y-1.5">
                <span className="text-[13px] font-semibold uppercase tracking-wider text-[#64748B] dark:text-gray-400 group-hover:text-[#2563EB] dark:group-hover:text-blue-400 transition-colors">
                  {card.title}
                </span>
                <h3 className="text-[32px] font-bold text-[#0F172A] dark:text-white leading-none tracking-tight">
                  {card.value}
                </h3>
              </div>
              <div className={`p-3 rounded-xl transition-all duration-200 group-hover:scale-105 ${getIconStyles(card.bg)}`}>
                <Icon className="w-5 h-5" />
              </div>
            </Link>
          );
        })}
      </div>

      {!isHR && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-dark-card border border-[#E5E7EB] dark:border-dark-border rounded-2xl p-6 shadow-sm transition-colors duration-300">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-[#2563EB] dark:text-blue-400" />
              <h3 className="text-[24px] font-bold text-[#0F172A] dark:text-white">Department Distribution</h3>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.deptDistribution || []}>
                  <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                  <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: 'rgb(22, 29, 48)', borderColor: 'rgb(36, 48, 79)', color: '#fff' }} />
                  <Bar dataKey="value" fill="#2563EB" radius={[4, 4, 0, 0]}>
                    {stats?.deptDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-card border border-[#E5E7EB] dark:border-dark-border rounded-2xl p-6 shadow-sm flex flex-col justify-between transition-colors duration-300">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-[#16A34A] dark:text-green-400" />
              <h3 className="text-[24px] font-bold text-[#0F172A] dark:text-white">Active vs Inactive</h3>
            </div>
            <div className="h-52 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.statusDistribution || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats?.statusDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'rgb(22, 29, 48)', borderColor: 'rgb(36, 48, 79)', color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[13px] text-[#64748B] dark:text-gray-400 uppercase font-semibold">Active</span>
                <span className="text-[32px] font-bold text-[#0F172A] dark:text-white leading-none">
                  {stats ? Math.round((stats.active / (stats.total || 1)) * 100) : 0}%
                </span>
              </div>
            </div>
            <div className="flex items-center justify-center gap-4 pt-4 border-t border-gray-50 dark:border-dark-border text-[13px]">
              <div className="flex items-center gap-1.5 font-semibold text-[#64748B] dark:text-gray-400">
                <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A]"></span>
                <span>Active</span>
              </div>
              <div className="flex items-center gap-1.5 font-semibold text-[#64748B] dark:text-gray-400">
                <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626]"></span>
                <span>Inactive</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-dark-card border border-[#E5E7EB] dark:border-dark-border rounded-2xl p-6 shadow-sm space-y-4 transition-colors duration-300">
        <div className="flex justify-between items-center">
          <h3 className="text-[24px] font-bold text-[#0F172A] dark:text-white">Recent Employees</h3>
          <Link
            to="/employees"
            className="text-xs font-bold text-[#2563EB] dark:text-blue-400 hover:text-blue-750 flex items-center gap-1 transition-all"
          >
            View Directory
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto border border-gray-100 dark:border-dark-border rounded-xl">
          <table className="min-w-full divide-y divide-gray-100 dark:divide-dark-border text-left text-sm text-[#0F172A] dark:text-gray-255">
            <thead className="bg-[#F8FAFC] dark:bg-dark-bg/40 font-bold text-gray-500 dark:text-gray-450 text-[13px] uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Employee ID</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Designation</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-dark-border">
              {recentEmployees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-[#64748B] dark:text-gray-400 text-sm">
                    No employees added recently.
                  </td>
                </tr>
              ) : (
                recentEmployees.map((emp, i) => (
                  <tr key={i} className="hover:bg-gray-50/30 dark:hover:bg-gray-800/20 transition-all text-sm">
                    <td className="px-6 py-4 font-bold text-[#64748B] dark:text-gray-400">{emp.employeeId}</td>
                    <td className="px-6 py-4 font-bold text-[#0F172A] dark:text-white">{emp.name}</td>
                    <td className="px-6 py-4 text-gray-655 dark:text-gray-400">{emp.department}</td>
                    <td className="px-6 py-4 text-gray-655 dark:text-gray-400">{emp.designation}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        emp.status === 'Active' ? 'bg-green-50 dark:bg-green-950/20 text-[#16A34A] dark:text-green-400' : 'bg-red-50 dark:bg-red-950/20 text-[#DC2626] dark:text-red-400'
                      }`}>
                        {emp.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
