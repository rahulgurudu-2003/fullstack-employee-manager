import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  UserCheck,
  UserX,
  Layers,
  DollarSign,
  TrendingUp
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
  Tooltip,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';

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

const Reports: React.FC = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [totalSalary, setTotalSalary] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await fetch('/api/organization/stats', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const empRes = await fetch('/api/employees?limit=1000', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (statsRes.ok && empRes.ok) {
          const statsData = await statsRes.json();
          const empData = await empRes.json();

          setStats(statsData.data);

          const activeSalaries = empData.data.employees
            .filter((emp: any) => emp.status === 'Active')
            .reduce((sum: number, emp: any) => sum + (emp.salary || 0), 0);
          setTotalSalary(activeSalaries);
        }
      } catch (err) {
        console.error('Failed to load reports data', err);
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
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] bg-[#F8FAFC]">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const growthData = [
    { month: 'Jan', count: 180 },
    { month: 'Feb', count: 210 },
    { month: 'Mar', count: 235 },
    { month: 'Apr', count: 260 },
    { month: 'May', count: 290 },
    { month: 'Jun', count: stats?.total || 324 },
  ];

  const joiningData = [
    { month: 'Jan', Joined: 8 },
    { month: 'Feb', Joined: 15 },
    { month: 'Mar', Joined: 12 },
    { month: 'Apr', Joined: 20 },
    { month: 'May', Joined: 25 },
    { month: 'Jun', Joined: 18 },
  ];

  const reportCards = [
    {
      title: 'Total Headcount',
      value: stats?.total || 0,
      icon: Users,
      color: 'text-[#2563EB]',
      bg: 'bg-blue-50',
    },
    {
      title: 'Active Employees',
      value: stats?.active || 0,
      icon: UserCheck,
      color: 'text-[#16A34A]',
      bg: 'bg-green-50',
    },
    {
      title: 'Inactive Accounts',
      value: stats?.inactive || 0,
      icon: UserX,
      color: 'text-[#DC2626]',
      bg: 'bg-red-50',
    },
    {
      title: 'Monthly Salary Cost',
      value: `$${(totalSalary / 12).toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      icon: DollarSign,
      color: 'text-[#EA580C]',
      bg: 'bg-orange-50',
    },
    {
      title: 'Departments',
      value: stats?.departmentCount || 0,
      icon: Layers,
      color: 'text-[#64748B]',
      bg: 'bg-slate-50',
    },
  ];

  const getIconStyles = (bg: string) => {
    if (bg.includes('blue')) return 'bg-blue-50 dark:bg-blue-950/40 text-[#2563EB] dark:text-blue-400';
    if (bg.includes('green')) return 'bg-green-50 dark:bg-green-950/40 text-[#16A34A] dark:text-green-400';
    if (bg.includes('red')) return 'bg-red-50 dark:bg-red-950/40 text-[#DC2626] dark:text-red-400';
    if (bg.includes('orange')) return 'bg-orange-50 dark:bg-orange-950/40 text-[#EA580C] dark:text-orange-400';
    return 'bg-slate-50 dark:bg-slate-800 text-[#64748B] dark:text-gray-400';
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto bg-transparent transition-colors duration-300">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white">Reports & Analytics</h1>
        <p className="text-sm text-[#64748B] dark:text-gray-400">Real-time organization metrics, staff development ratios, and fiscal operational stats.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {reportCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-xl p-6 shadow-sm flex items-center justify-between hover:shadow-md transition-all duration-300">
              <div className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B] dark:text-gray-400">
                  {card.title}
                </span>
                <h3 className="text-2xl font-bold text-[#0F172A] dark:text-white">{card.value}</h3>
              </div>
              <div className={`p-3 rounded-lg ${getIconStyles(card.bg)}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-xl p-6 shadow-sm transition-colors duration-300">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-[#2563EB] dark:text-blue-400" />
            <h3 className="font-bold text-[#0F172A] dark:text-white">Employee Growth (Cumulative)</h3>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#64748B" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={12} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: 'rgb(22, 29, 48)', borderColor: 'rgb(36, 48, 79)', color: '#fff' }} />
                <Line type="monotone" dataKey="count" stroke="#2563EB" strokeWidth={3} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-xl p-6 shadow-sm transition-colors duration-300">
          <div className="flex items-center gap-2 mb-6">
            <Layers className="w-5 h-5 text-[#8B5CF6] dark:text-purple-400" />
            <h3 className="font-bold text-[#0F172A] dark:text-white">Staffing Distribution by Department</h3>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.deptDistribution || []}>
                <XAxis dataKey="name" stroke="#64748B" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={12} tickLine={false} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: 'rgb(22, 29, 48)', borderColor: 'rgb(36, 48, 79)', color: '#fff' }} />
                <Bar dataKey="value" fill="#2563EB" radius={[6, 6, 0, 0]}>
                  {stats?.deptDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-xl p-6 shadow-sm flex flex-col justify-between transition-colors duration-300">
          <div>
            <h3 className="font-bold text-[#0F172A] dark:text-white mb-2">Account Activity Ratio</h3>
            <p className="text-xs text-[#64748B] dark:text-gray-400">Ratio of active personnel versus inactive accounts.</p>
          </div>
          <div className="h-56 w-full relative my-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.statusDistribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={75}
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
              <span className="text-xs text-[#64748B] dark:text-gray-400 uppercase font-semibold">Active</span>
              <span className="text-2xl font-black text-[#0F172A] dark:text-white">
                {stats ? Math.round((stats.active / (stats.total || 1)) * 100) : 0}%
              </span>
            </div>
          </div>
          <div className="flex items-center justify-center gap-6 pt-2 border-t border-gray-50 dark:border-dark-border">
            <div className="flex items-center gap-1.5 text-xs text-[#64748B] dark:text-gray-400 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A]"></span>
              <span>Active</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#64748B] dark:text-gray-400 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626]"></span>
              <span>Inactive</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-xl p-6 shadow-sm lg:col-span-2 flex flex-col justify-between transition-colors duration-300">
          <div>
            <h3 className="font-bold text-[#0F172A] dark:text-white mb-1">New Hires Onboarding</h3>
            <p className="text-xs text-[#64748B] dark:text-gray-400">Count of employees registered each month.</p>
          </div>
          <div className="h-60 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={joiningData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#64748B" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={12} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: 'rgb(22, 29, 48)', borderColor: 'rgb(36, 48, 79)', color: '#fff' }} />
                <Bar dataKey="Joined" fill="#EA580C" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
