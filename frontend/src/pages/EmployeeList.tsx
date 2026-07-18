import React, { useEffect, useState } from 'react';
import { useAuth, Employee } from '../context/AuthContext';
import {
  Search,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Upload,
  UserPlus,
  Loader2,
  Eye,
  FileSpreadsheet,
  Users,
  RotateCcw
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const EmployeeList: React.FC = () => {
  const { token, user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [deptFilter, setDeptFilter] = useState(searchParams.get('department') || '');
  const [roleFilter, setRoleFilter] = useState(searchParams.get('role') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [allManagersList, setAllManagersList] = useState<{ _id: string; name: string; designation: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const [showFormModal, setShowFormModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState<string | null>(null);

  const [empIdInput, setEmpIdInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [deptInput, setDeptInput] = useState('');
  const [desgInput, setDesgInput] = useState('');
  const [salaryInput, setSalaryInput] = useState(0);
  const [joiningDateInput, setJoiningDateInput] = useState('');
  const [statusInput, setStatusInput] = useState<'Active' | 'Inactive'>('Active');
  const [roleInput, setRoleInput] = useState<'Super Admin' | 'HR Manager' | 'Employee'>('Employee');
  const [managerInput, setManagerInput] = useState('');
  const [profileImageBase64, setProfileImageBase64] = useState('');
  const [passwordInput, setPasswordInput] = useState('');

  const [csvRawText, setCsvRawText] = useState('');
  const [importResult, setImportResult] = useState<{ importedCount: number; errors: string[] } | null>(null);
  const [importLoading, setImportLoading] = useState(false);

  const [formError, setFormError] = useState('');
  const [formSaving, setFormSaving] = useState(false);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        search,
        department: deptFilter,
        role: roleFilter,
        status: statusFilter,
        sortBy,
        sortOrder,
        page: page.toString(),
        limit: limit.toString(),
      });

      const isManager = searchParams.get('isManager');
      if (isManager) {
        queryParams.append('isManager', isManager);
      }

      const response = await fetch(`/api/employees?${queryParams.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const result = await response.json();
        setEmployees(result.data.employees);
        setTotalPages(result.pages || 1);
        setTotalResults(result.total || 0);
      }
    } catch (err) {
      console.error('Error fetching employees list:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchManagersList = async () => {
    try {
      const response = await fetch('/api/employees?limit=1000', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const result = await response.json();
        setAllManagersList(
          result.data.employees.map((emp: Employee) => ({
            _id: emp._id,
            name: emp.name,
            designation: emp.designation,
          }))
        );
      }
    } catch (err) {
      console.error('Error fetching managers list:', err);
    }
  };

  useEffect(() => {
    const querySearch = searchParams.get('search');
    if (querySearch !== null && querySearch !== search) {
      setSearch(querySearch);
    }
    const queryDept = searchParams.get('department');
    if (queryDept !== null && queryDept !== deptFilter) {
      setDeptFilter(queryDept);
    }
    const queryRole = searchParams.get('role');
    if (queryRole !== null && queryRole !== roleFilter) {
      setRoleFilter(queryRole);
    }
    const queryStatus = searchParams.get('status');
    if (queryStatus !== null && queryStatus !== statusFilter) {
      setStatusFilter(queryStatus);
    }
  }, [searchParams]);

  useEffect(() => {
    setPage(1);
  }, [search, deptFilter, roleFilter, statusFilter, sortBy, sortOrder]);

  useEffect(() => {
    if (token) {
      fetchEmployees();
      fetchManagersList();
    }
  }, [token, search, deptFilter, roleFilter, statusFilter, sortBy, sortOrder, page, searchParams]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImageBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenCreate = () => {
    setIsEditMode(false);
    setSelectedEmpId(null);
    setFormError('');
    setEmpIdInput('');
    setNameInput('');
    setEmailInput('');
    setPhoneInput('');
    setDeptInput('');
    setDesgInput('');
    setSalaryInput(0);
    setJoiningDateInput(new Date().toISOString().substring(0, 10));
    setStatusInput('Active');
    setRoleInput('Employee');
    setManagerInput('');
    setProfileImageBase64('');
    setPasswordInput('');
    setShowFormModal(true);
  };

  const handleOpenEdit = (emp: Employee) => {
    setIsEditMode(true);
    setSelectedEmpId(emp._id);
    setFormError('');
    setEmpIdInput(emp.employeeId);
    setNameInput(emp.name);
    setEmailInput(emp.email);
    setPhoneInput(emp.phone);
    setDeptInput(emp.department);
    setDesgInput(emp.designation);
    setSalaryInput(emp.salary);
    setJoiningDateInput(new Date(emp.joiningDate).toISOString().substring(0, 10));
    setStatusInput(emp.status);
    setRoleInput(emp.role);
    setManagerInput(emp.reportingManager?._id || '');
    setProfileImageBase64(emp.profileImage || '');
    setPasswordInput('');
    setShowFormModal(true);
  };

  const handleSaveEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSaving(true);

    const payload: any = {
      employeeId: empIdInput,
      name: nameInput,
      email: emailInput,
      phone: phoneInput,
      department: deptInput,
      designation: desgInput,
      salary: salaryInput,
      joiningDate: joiningDateInput,
      status: statusInput,
      role: roleInput,
      reportingManager: managerInput || null,
      profileImage: profileImageBase64,
    };

    if (passwordInput) {
      payload.password = passwordInput;
    }

    try {
      const url = isEditMode ? `/api/employees/${selectedEmpId}` : '/api/employees';
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        setShowFormModal(false);
        fetchEmployees();
        fetchManagersList();
      } else {
        setFormError(result.message || 'Validation failed. Check your inputs.');
      }
    } catch (err) {
      setFormError('Network error. Failed to save.');
    } finally {
      setFormSaving(false);
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    if (!window.confirm('Are you sure you want to soft delete this employee record?')) return;

    try {
      const response = await fetch(`/api/employees/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        fetchEmployees();
        fetchManagersList();
      } else {
        const result = await response.json();
        alert(result.message || 'Failed to delete employee.');
      }
    } catch (err) {
      alert('Network error. Failed to delete.');
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setDeptFilter('');
    setRoleFilter('');
    setStatusFilter('');
    setSortBy('name');
    setSortOrder('asc');
    setPage(1);
    navigate('/employees');
  };

  const handleCSVImport = async (e: React.FormEvent) => {
    e.preventDefault();
    setImportResult(null);
    setImportLoading(true);

    try {
      const response = await fetch('/api/employees/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ csvData: csvRawText }),
      });

      const result = await response.json();

      if (response.ok) {
        setImportResult({
          importedCount: result.importedCount,
          errors: result.errors || [],
        });
        fetchEmployees();
        fetchManagersList();
      } else {
        alert(result.message || 'Import failed');
      }
    } catch (err) {
      alert('Network error. Failed to import CSV.');
    } finally {
      setImportLoading(false);
    }
  };

  const departments = ['Engineering', 'Human Resources', 'Product', 'Marketing', 'Sales', 'Executive'];
  const isManagerView = searchParams.get('isManager') === 'true';

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            {isManagerView ? 'Managers Directory' : 'Employees Directory'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {isManagerView 
              ? `Displaying ${totalResults} manager records. Filter, update or view details.` 
              : `Displaying ${totalResults} total records. Filter, update, delete or import.`
            }
          </p>
        </div>

        {(currentUser?.role === 'Super Admin' || currentUser?.role === 'HR Manager') && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setCsvRawText(`employeeId,name,email,phone,department,designation,salary,joiningDate,status,role,reportingManagerId\nEMP-100,Alex Reed,alex@ems.com,5553013000,Engineering,Software Architect,130000,2024-05-01,Active,Employee,EMP-003`);
                setImportResult(null);
                setShowImportModal(true);
              }}
              className="flex items-center gap-2 border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold px-4 py-2.5 rounded-xl transition"
            >
              <Upload className="w-5 h-5" />
              <span>Import CSV</span>
            </button>
            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-blue-500/10 transition"
            >
              <UserPlus className="w-5 h-5" />
              <span>Add Employee</span>
            </button>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-2xl p-6 shadow-sm flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <Search className="w-5 h-5" />
            </span>
            <input
              type="text"
              placeholder="Search by name, email, employee ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl py-3 pl-11 pr-4 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
            />
          </div>
          <button
            onClick={handleResetFilters}
            className="flex items-center justify-center gap-2 border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold px-5 py-3 rounded-xl transition cursor-pointer shadow-sm text-sm"
            title="Reset All Filters"
          >
            <RotateCcw className="w-4 h-4 text-gray-500" />
            <span>Reset</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Department</label>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl py-2.5 px-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Role</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl py-2.5 px-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Roles</option>
              <option value="Super Admin">Super Admin</option>
              <option value="HR Manager">HR Manager</option>
              <option value="Employee">Employee</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl py-2.5 px-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl py-2.5 px-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="name">Name</option>
              <option value="joiningDate">Joining Date</option>
              <option value="employeeId">Employee ID</option>
              <option value="salary">Salary</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Sort Order</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl py-2.5 px-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-2xl shadow-sm overflow-hidden transition-all">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            <span className="text-sm font-semibold text-gray-400">Loading directory...</span>
          </div>
        ) : employees.length === 0 ? (
          <div className="p-20 text-center text-gray-400 dark:text-gray-500">
            <Users className="w-16 h-16 mx-auto mb-4 stroke-[1.5]" />
            <p className="font-bold text-lg">No records found</p>
            <p className="text-sm mt-1">Try resetting search string or active filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-dark-border bg-gray-50 dark:bg-gray-800/40 text-xs font-bold uppercase text-gray-400 tracking-wider">
                  <th className="py-4 px-6">Employee ID</th>
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-6">Department</th>
                  <th className="py-4 px-6">Designation</th>
                  <th className="py-4 px-6">Role</th>
                  <th className="py-4 px-6">Manager</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-dark-border text-sm">
                {employees.map((emp) => (
                  <tr
                    key={emp._id}
                    className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors"
                  >
                    <td className="py-4 px-6 font-bold text-gray-900 dark:text-white">
                      {emp.employeeId}
                    </td>
                    <td className="py-4 px-6 flex items-center gap-3">
                      {emp.profileImage ? (
                        <img
                          src={emp.profileImage}
                          alt={emp.name}
                          className="w-9 h-9 rounded-full object-cover border"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                          {emp.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-gray-100">{emp.name}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">{emp.email}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-600 dark:text-gray-300">
                      {emp.department}
                    </td>
                    <td className="py-4 px-6 text-gray-600 dark:text-gray-300">
                      {emp.designation}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                          emp.role === 'Super Admin'
                            ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                            : emp.role === 'HR Manager'
                            ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        {emp.role}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-600 dark:text-gray-300">
                      {emp.reportingManager?.name || (
                        <span className="text-gray-300 dark:text-gray-600">None (CEO)</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                          emp.status === 'Active'
                            ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
                            : 'bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {emp.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => navigate(`/profile?id=${emp._id}`)}
                          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {(currentUser?.role === 'Super Admin' || (currentUser?.role === 'HR Manager' && emp.role !== 'Super Admin')) && (
                          <button
                            onClick={() => handleOpenEdit(emp)}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500 hover:text-blue-500 transition"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}

                        {currentUser?.role === 'Super Admin' && (
                          <button
                            onClick={() => handleDeleteEmployee(emp._id)}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500 hover:text-red-500 transition"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && totalResults > 0 && (
          <div className="p-6 border-t border-gray-100 dark:border-dark-border flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400">
              Showing {(page - 1) * limit + 1} - {Math.min(page * limit, totalResults)} of {totalResults}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="p-2 border dark:border-dark-border rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 disabled:opacity-40 disabled:pointer-events-none transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-bold text-gray-700 dark:text-gray-300 px-2">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="p-2 border dark:border-dark-border rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 disabled:opacity-40 disabled:pointer-events-none transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {showFormModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-dark-card border dark:border-dark-border rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b dark:border-dark-border pb-4 mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {isEditMode ? 'Edit Employee Details' : 'Add New Employee'}
              </h3>
              <button
                onClick={() => setShowFormModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white font-extrabold"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-6">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveEmployee} className="space-y-6">
              <div className="flex items-center gap-4 bg-gray-50 dark:bg-dark-bg p-4 rounded-2xl border dark:border-dark-border">
                {profileImageBase64 ? (
                  <img
                    src={profileImageBase64}
                    alt="Upload Preview"
                    className="w-16 h-16 rounded-full object-cover border-2 border-blue-500/20"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center text-blue-500">
                    <Upload className="w-6 h-6" />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 cursor-pointer">
                    Upload Profile Picture
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-400 mt-1">Image files up to 2MB (Base64)</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Employee ID</label>
                  <input
                    type="text"
                    required
                    disabled={isEditMode}
                    placeholder="e.g. EMP-101"
                    value={empIdInput}
                    onChange={(e) => setEmpIdInput(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl py-2.5 px-4 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Alex Smith"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl py-2.5 px-4 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="alex@company.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl py-2.5 px-4 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9876543210"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl py-2.5 px-4 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Department</label>
                  <select
                    value={deptInput}
                    required
                    onChange={(e) => setDeptInput(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl py-2.5 px-4 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="">Select Department</option>
                    {departments.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Designation</label>
                  <input
                    type="text"
                    required
                    placeholder="Senior Engineer"
                    value={desgInput}
                    onChange={(e) => setDesgInput(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl py-2.5 px-4 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Annual Salary ($)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    placeholder="85000"
                    value={salaryInput}
                    onChange={(e) => setSalaryInput(parseFloat(e.target.value) || 0)}
                    className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl py-2.5 px-4 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Joining Date</label>
                  <input
                    type="date"
                    required
                    value={joiningDateInput}
                    onChange={(e) => setJoiningDateInput(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl py-2.5 px-4 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Access Role</label>
                  <select
                    value={roleInput}
                    disabled={currentUser?.role === 'HR Manager'}
                    onChange={(e) => setRoleInput(e.target.value as any)}
                    className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl py-2.5 px-4 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-60"
                  >
                    <option value="Employee">Employee (Self Profile Edit)</option>
                    <option value="HR Manager">HR Manager (Manage Directory)</option>
                    {currentUser?.role === 'Super Admin' && (
                      <option value="Super Admin">Super Admin (Full Access)</option>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Reporting Manager</label>
                  <select
                    value={managerInput}
                    onChange={(e) => setManagerInput(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl py-2.5 px-4 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="">None (Top-Level / CEO)</option>
                    {allManagersList
                      .filter((m) => m._id !== selectedEmpId)
                      .map((m) => (
                        <option key={m._id} value={m._id}>
                          {m.name} ({m.designation})
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Account Status</label>
                  <select
                    value={statusInput}
                    onChange={(e) => setStatusInput(e.target.value as any)}
                    className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl py-2.5 px-4 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Password {isEditMode ? '(Leave blank to keep current)' : '(Required)'}
                  </label>
                  <input
                    type="password"
                    required={!isEditMode}
                    placeholder="••••••••"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl py-2.5 px-4 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-4 border-t dark:border-dark-border pt-6 mt-6">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-5 py-2.5 border dark:border-dark-border rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSaving}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/15 flex items-center gap-2 transition disabled:opacity-60"
                >
                  {formSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Save Record</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showImportModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-dark-card border dark:border-dark-border rounded-3xl w-full max-w-xl p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b dark:border-dark-border pb-4 mb-6">
              <div className="flex items-center gap-2 text-blue-500">
                <FileSpreadsheet className="w-6 h-6" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Bulk CSV Import</h3>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white font-extrabold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCSVImport} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  CSV Raw Data Text (including Header row)
                </label>
                <textarea
                  rows={8}
                  required
                  value={csvRawText}
                  onChange={(e) => setCsvRawText(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl py-3 px-4 text-xs font-mono text-gray-950 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {importResult && (
                <div className="bg-blue-500/5 border border-blue-500/20 text-gray-600 dark:text-gray-300 text-xs p-4 rounded-xl space-y-2">
                  <p className="font-bold text-blue-600 dark:text-blue-400">
                    Successfully Imported: {importResult.importedCount} rows
                  </p>
                  {importResult.errors.length > 0 && (
                    <div className="mt-2 text-rose-500">
                      <p className="font-semibold mb-1">Errors/Skipped:</p>
                      <ul className="list-disc pl-4 space-y-1 max-h-32 overflow-y-auto">
                        {importResult.errors.map((err, idx) => (
                          <li key={idx}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-end gap-4 pt-4 border-t dark:border-dark-border">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-5 py-2.5 border dark:border-dark-border rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={importLoading}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg flex items-center gap-2 transition disabled:opacity-60"
                >
                  {importLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Start Import</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;
