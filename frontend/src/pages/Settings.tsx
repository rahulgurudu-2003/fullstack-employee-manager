import React, { useState } from 'react';
import { Shield, Settings as SettingsIcon, CheckSquare, Save } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

const Settings: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') || 'general';

  const activeTab = tabParam === 'permissions' || tabParam === 'roles'
    ? 'permissions'
    : tabParam === 'security'
      ? 'security'
      : 'general';

  const setActiveTab = (tab: 'general' | 'security' | 'permissions') => {
    setSearchParams({ tab });
  };

  const [generalSettings, setGeneralSettings] = useState({
    companyName: 'Enterprise Solutions Corp',
    supportEmail: 'support@ems-enterprise.com',
    sessionTimeout: '60',
    timezone: 'UTC +5:30 (India Standard Time)',
  });

  const [securitySettings, setSecuritySettings] = useState({
    minPasswordLength: 8,
    requireSpecialChar: true,
    requireNumbers: true,
    mfaEnabled: false,
  });

  const [permissions, setPermissions] = useState([
    { feature: 'View Employees', superAdmin: true, hr: true, employee: true },
    { feature: 'Create Employee', superAdmin: true, hr: true, employee: false },
    { feature: 'Edit Employee', superAdmin: true, hr: true, employee: false },
    { feature: 'Delete Employee', superAdmin: true, hr: false, employee: false },
    { feature: 'Reports Access', superAdmin: true, hr: true, employee: false },
    { feature: 'System Settings', superAdmin: true, hr: false, employee: false },
  ]);

  const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setGeneralSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSecurityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked, type, value } = e.target;
    setSecuritySettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : parseInt(value, 10),
    }));
  };

  const handlePermissionChange = (index: number, role: 'superAdmin' | 'hr' | 'employee') => {
    if (role === 'superAdmin') return;
    setPermissions((prev) =>
      prev.map((p, idx) => (idx === index ? { ...p, [role]: !p[role] } : p))
    );
  };

  const handleSave = (section: string) => {
    alert(`${section} settings updated successfully!`);
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto bg-transparent transition-colors duration-300">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white">Settings</h1>
        <p className="text-sm text-[#64748B] dark:text-gray-400">Configure organization general constants, safety parameters, and role authorizations.</p>
      </div>

      <div className="flex border border-gray-100 dark:border-dark-border bg-white dark:bg-dark-card p-1.5 rounded-xl max-w-md shadow-sm">
        <button
          onClick={() => setActiveTab('general')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeTab === 'general'
              ? 'bg-blue-50 dark:bg-blue-950/40 text-[#2563EB] dark:text-blue-400'
              : 'text-[#64748B] dark:text-gray-400 hover:text-[#0F172A] dark:hover:text-white'
          }`}
        >
          <SettingsIcon className="w-4 h-4" />
          General
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeTab === 'security'
              ? 'bg-blue-50 dark:bg-blue-950/40 text-[#2563EB] dark:text-blue-400'
              : 'text-[#64748B] dark:text-gray-400 hover:text-[#0F172A] dark:hover:text-white'
          }`}
        >
          <Shield className="w-4 h-4" />
          Security
        </button>
        <button
          onClick={() => setActiveTab('permissions')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeTab === 'permissions'
              ? 'bg-blue-50 dark:bg-blue-950/40 text-[#2563EB] dark:text-blue-400'
              : 'text-[#64748B] dark:text-gray-400 hover:text-[#0F172A] dark:hover:text-white'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          Permissions Matrix
        </button>
      </div>

      <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-xl p-8 shadow-sm transition-colors duration-300">
        {activeTab === 'general' && (
          <div className="space-y-6 max-w-xl">
            <h3 className="text-lg font-bold text-[#0F172A] dark:text-white border-b border-gray-50 dark:border-dark-border pb-2">General Configuration</h3>
            <div className="grid grid-cols-1 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#64748B] dark:text-gray-400">Company Name</label>
                <input
                  type="text"
                  name="companyName"
                  value={generalSettings.companyName}
                  onChange={handleGeneralChange}
                  className="w-full px-4 py-2.5 text-sm border border-gray-100 dark:border-dark-border rounded-lg bg-gray-50/50 dark:bg-dark-bg/20 focus:outline-none focus:border-[#2563EB] focus:bg-white dark:focus:bg-dark-bg/60 transition-all text-[#0F172A] dark:text-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#64748B] dark:text-gray-400">Support / Contact Email</label>
                <input
                  type="email"
                  name="supportEmail"
                  value={generalSettings.supportEmail}
                  onChange={handleGeneralChange}
                  className="w-full px-4 py-2.5 text-sm border border-gray-100 dark:border-dark-border rounded-lg bg-gray-50/50 dark:bg-dark-bg/20 focus:outline-none focus:border-[#2563EB] focus:bg-white dark:focus:bg-dark-bg/60 transition-all text-[#0F172A] dark:text-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#64748B] dark:text-gray-400">User Session Expiry Timeout (Minutes)</label>
                <input
                  type="number"
                  name="sessionTimeout"
                  value={generalSettings.sessionTimeout}
                  onChange={handleGeneralChange}
                  className="w-full px-4 py-2.5 text-sm border border-gray-100 dark:border-dark-border rounded-lg bg-gray-50/50 dark:bg-dark-bg/20 focus:outline-none focus:border-[#2563EB] focus:bg-white dark:focus:bg-dark-bg/60 transition-all text-[#0F172A] dark:text-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#64748B] dark:text-gray-400">Server Timezone Offset</label>
                <select
                  name="timezone"
                  value={generalSettings.timezone}
                  onChange={handleGeneralChange}
                  className="w-full px-4 py-2.5 text-sm border border-gray-100 dark:border-dark-border rounded-lg bg-gray-50/50 dark:bg-dark-bg/20 focus:outline-none focus:border-[#2563EB] focus:bg-white dark:focus:bg-dark-bg/60 transition-all text-[#0F172A] dark:text-white"
                >
                  <option className="dark:bg-dark-card">UTC +5:30 (India Standard Time)</option>
                  <option className="dark:bg-dark-card">UTC -5:00 (Eastern Standard Time)</option>
                  <option className="dark:bg-dark-card">UTC +0:00 (Greenwich Mean Time)</option>
                  <option className="dark:bg-dark-card">UTC +1:00 (Central European Time)</option>
                </select>
              </div>
            </div>
            <button
              onClick={() => handleSave('General')}
              className="flex items-center gap-2 bg-[#2563EB] hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Save General Settings
            </button>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6 max-w-xl">
            <h3 className="text-lg font-bold text-[#0F172A] dark:text-white border-b border-gray-50 dark:border-dark-border pb-2">Security & Hashing Credentials</h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#64748B] dark:text-gray-400">Minimum Password Strength Length</label>
                <input
                  type="number"
                  name="minPasswordLength"
                  value={securitySettings.minPasswordLength}
                  onChange={handleSecurityChange}
                  className="w-full px-4 py-2.5 text-sm border border-gray-100 dark:border-dark-border rounded-lg bg-gray-50/50 dark:bg-dark-bg/20 focus:outline-none focus:border-[#2563EB] focus:bg-white dark:focus:bg-dark-bg/60 transition-all text-[#0F172A] dark:text-white"
                />
              </div>
              <label className="flex items-center gap-3 p-3 bg-gray-50/50 dark:bg-dark-bg/10 border border-gray-100 dark:border-dark-border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-all">
                <input
                  type="checkbox"
                  name="requireSpecialChar"
                  checked={securitySettings.requireSpecialChar}
                  onChange={handleSecurityChange}
                  className="w-4.5 h-4.5 text-[#2563EB] border-gray-300 rounded focus:ring-[#2563EB]"
                />
                <span className="text-sm font-medium text-[#0F172A] dark:text-white">Force special characters (`@, #, $, !`) in passwords</span>
              </label>
              <label className="flex items-center gap-3 p-3 bg-gray-50/50 dark:bg-dark-bg/10 border border-gray-100 dark:border-dark-border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-all">
                <input
                  type="checkbox"
                  name="requireNumbers"
                  checked={securitySettings.requireNumbers}
                  onChange={handleSecurityChange}
                  className="w-4.5 h-4.5 text-[#2563EB] border-gray-300 rounded focus:ring-[#2563EB]"
                />
                <span className="text-sm font-medium text-[#0F172A] dark:text-white">Force numeric digits in passwords</span>
              </label>
              <label className="flex items-center gap-3 p-3 bg-gray-50/50 dark:bg-dark-bg/10 border border-gray-100 dark:border-dark-border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-all">
                <input
                  type="checkbox"
                  name="mfaEnabled"
                  checked={securitySettings.mfaEnabled}
                  onChange={handleSecurityChange}
                  className="w-4.5 h-4.5 text-[#2563EB] border-gray-300 rounded focus:ring-[#2563EB]"
                />
                <span className="text-sm font-medium text-[#0F172A] dark:text-white">Mandatory Multi-Factor Authentication (MFA) on login</span>
              </label>
            </div>
            <button
              onClick={() => handleSave('Security')}
              className="flex items-center gap-2 bg-[#2563EB] hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Save Security Rules
            </button>
          </div>
        )}

        {activeTab === 'permissions' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-[#0F172A] dark:text-white mb-1">Roles & Resource Permissions</h3>
              <p className="text-xs text-[#64748B] dark:text-gray-400">Activate or lock application routes and resource endpoints per role group.</p>
            </div>

            <div className="overflow-x-auto border border-gray-100 dark:border-dark-border rounded-xl">
              <table className="min-w-full divide-y divide-gray-100 dark:divide-dark-border text-left text-sm text-[#0F172A] dark:text-white">
                <thead className="bg-gray-50/70 dark:bg-dark-bg/40 font-semibold text-[#64748B] dark:text-gray-400 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Application Feature Scope</th>
                    <th className="px-6 py-4 text-center">Super Admin</th>
                    <th className="px-6 py-4 text-center">HR Manager</th>
                    <th className="px-6 py-4 text-center">Standard Employee</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-dark-border">
                  {permissions.map((p, i) => (
                    <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/10 transition-all">
                      <td className="px-6 py-4.5 font-medium">{p.feature}</td>
                      <td className="px-6 py-4.5 text-center">
                        <input
                          type="checkbox"
                          checked={p.superAdmin}
                          disabled
                          className="w-4.5 h-4.5 text-[#2563EB] border-gray-200 dark:border-dark-border rounded cursor-not-allowed opacity-60"
                        />
                      </td>
                      <td className="px-6 py-4.5 text-center">
                        <input
                          type="checkbox"
                          checked={p.hr}
                          onChange={() => handlePermissionChange(i, 'hr')}
                          className="w-4.5 h-4.5 text-[#2563EB] border-gray-300 dark:border-dark-border rounded focus:ring-[#2563EB] cursor-pointer"
                        />
                      </td>
                      <td className="px-6 py-4.5 text-center">
                        <input
                          type="checkbox"
                          checked={p.employee}
                          onChange={() => handlePermissionChange(i, 'employee')}
                          className="w-4.5 h-4.5 text-[#2563EB] border-gray-300 dark:border-dark-border rounded focus:ring-[#2563EB] cursor-pointer"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              onClick={() => handleSave('Permissions')}
              className="flex items-center gap-2 bg-[#2563EB] hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Save Permissions Matrix
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
