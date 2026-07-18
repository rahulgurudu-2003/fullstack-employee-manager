import React, { useEffect, useState } from 'react';
import { useAuth, Employee } from '../context/AuthContext';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  Briefcase,
  DollarSign,
  Calendar,
  Shield,
  Layers,
  Activity as ActivityIcon,
  ArrowLeft,
  Edit,
  Save,
  X,
  Upload,
  UserCheck,
  Network,
  Loader2,
  FileText,
  Clock,
  Download
} from 'lucide-react';

const Profile: React.FC = () => {
  const { token, user: currentUser, updateUser, refreshUser } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const targetId = searchParams.get('id') || currentUser?._id;
  const isOwnProfile = targetId === currentUser?._id;

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [reportees, setReportees] = useState<Employee[]>([]);
  const [allManagers, setAllManagers] = useState<{ _id: string; name: string; designation: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [activeTab, setActiveTab] = useState<'overview' | 'reporting' | 'activity' | 'documents'>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<{ name: string; size: string; category: string } | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [designation, setDesignation] = useState('');
  const [salary, setSalary] = useState(0);
  const [joiningDate, setJoiningDate] = useState('');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [role, setRole] = useState<'Super Admin' | 'HR Manager' | 'Employee'>('Employee');
  const [reportingManager, setReportingManager] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [password, setPassword] = useState('');
  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/employees/' + targetId, {
        headers: { Authorization: 'Bearer ' + token },
      });
      if (response.ok) {
        const result = await response.json();
        const emp: Employee = result.data.employee;
        setEmployee(emp);

        setName(emp.name);
        setEmail(emp.email);
        setPhone(emp.phone);
        setDepartment(emp.department);
        setDesignation(emp.designation);
        setSalary(emp.salary);
        setJoiningDate(new Date(emp.joiningDate).toISOString().substring(0, 10));
        setStatus(emp.status);
        setRole(emp.role);
        setReportingManager(emp.reportingManager?._id || '');
        setProfileImage(emp.profileImage || '');
      } else {
        const result = await response.json();
        setError(result.message || 'Failed to fetch employee details');
      }
    } catch (err) {
      setError('Network error. Failed to load employee details.');
    } finally {
      setLoading(false);
    }
  };

  const fetchReportees = async () => {
    try {
      const response = await fetch(`/api/employees/${targetId}/reportees`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const result = await response.json();
        setReportees(result.data.reportees || []);
      }
    } catch (err) {
      console.error('Failed to load reportees list', err);
    }
  };

  const fetchAllManagers = async () => {
    try {
      const response = await fetch('/api/employees?limit=1000', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const result = await response.json();
        setAllManagers(
          result.data.employees.map((emp: Employee) => ({
            _id: emp._id,
            name: emp.name,
            designation: emp.designation,
          }))
        );
      }
    } catch (err) {
      console.error('Failed to load managers list', err);
    }
  };

  useEffect(() => {
    if (token && targetId) {
      fetchProfile();
      fetchReportees();
      fetchAllManagers();
      setIsEditing(false);
    }
  }, [token, targetId]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const payload: any = {};
    const isEmployeeRole = currentUser?.role === 'Employee';
    const isHRRole = currentUser?.role === 'HR Manager';

    if (isEmployeeRole) {
      payload.phone = phone;
      payload.profileImage = profileImage;
      if (password) payload.password = password;
    } else if (isHRRole) {
      payload.name = name;
      payload.email = email;
      payload.phone = phone;
      payload.department = department;
      payload.designation = designation;
      payload.salary = salary;
      payload.joiningDate = joiningDate;
      payload.status = status;
      payload.reportingManager = reportingManager || null;
      payload.profileImage = profileImage;
      if (password) payload.password = password;
    } else {
      payload.name = name;
      payload.email = email;
      payload.phone = phone;
      payload.department = department;
      payload.designation = designation;
      payload.salary = salary;
      payload.joiningDate = joiningDate;
      payload.status = status;
      payload.role = role;
      payload.reportingManager = reportingManager || null;
      payload.profileImage = profileImage;
      if (password) payload.password = password;
    }

    try {
      const response = await fetch(`/api/employees/${targetId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        setEmployee(result.data.employee);
        setIsEditing(false);
        setPassword('');
        if (isOwnProfile) {
          updateUser(result.data.employee);
          refreshUser();
        }
        fetchProfile();
      } else {
        setError(result.message || 'Failed to save profile changes.');
      }
    } catch (err) {
      setError('Network error. Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = (docName: string) => {
    const sheetEl = document.getElementById('pdf-preview-sheet');
    if (!sheetEl) return;
    const contentHtml = sheetEl.innerHTML;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write('<html><head><title>' + docName + '</title><script src="https://cdn.tailwindcss.com"></script><style>@import url(\'https://fonts.googleapis.com/css2?family=Alex+Brush&family=Inter:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap\'); body { font-family: \'Inter\', sans-serif; background-color: white; color: black; padding: 40px; } .signature-font { font-family: \'Alex Brush\', cursive; } .serif-font { font-family: \'Playfair Display\', serif; }</style></head><body onload="window.print(); window.close();"><div class="max-w-3xl mx-auto border border-gray-200 p-12 rounded-lg shadow-sm bg-white">' + contentHtml + '</div></body></html>');
      printWindow.document.close();
    }
  };
  const renderDocPreview = () => {
    if (!selectedDoc) return null;

    if (selectedDoc.name === 'Offer_Letter.pdf') {
      return (
        <div className="text-gray-800 font-sans leading-relaxed text-left">
          <div className="border-b-2 border-blue-600 pb-4 mb-8 flex justify-between items-end">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-blue-600">ENTERPRISE SOLUTIONS CORP</h2>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mt-0.5">Corporate HR Department</p>
            </div>
            <div className="text-right text-[10px] text-gray-400">
              <p>100 Innovation Way, Suite 500</p>
              <p>Tech City, TC 94016</p>
              <p>support@ems-enterprise.com</p>
            </div>
          </div>

          <div className="text-xs space-y-1 mb-6 text-gray-700">
            <p className="font-bold text-gray-900">{new Date(employee?.joiningDate || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <div className="pt-2">
              <p className="font-bold text-gray-900">To:</p>
              <p className="font-bold text-blue-600 text-sm">{employee?.name}</p>
              <p>{employee?.designation}</p>
              <p>Dept. of {employee?.department}</p>
              <p>{employee?.email}</p>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-100 pb-1.5">Subject: Official Offer of Employment — {employee?.employeeId}</p>
          </div>

          <div className="text-xs space-y-4 text-gray-700">
            <p>Dear {employee?.name},</p>
            <p>
              On behalf of Enterprise Solutions Corp, we are absolutely delighted to offer you employment for the position of <strong className="text-gray-900">{employee?.designation}</strong> in our <strong className="text-gray-900">{employee?.department}</strong> department.
            </p>
            <p>
              In this role, you will report directly to your assigned Team Manager. Your official joining date has been established as <strong className="text-gray-900">{new Date(employee?.joiningDate || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong>.
            </p>
            <p>
              We are pleased to offer you a starting annual salary of <strong className="text-gray-900">${employee?.salary?.toLocaleString() || '0'} USD</strong>, payable in semi-monthly installments in accordance with our standard company payroll cycle, subject to regular tax deductions.
            </p>
            <p>
              Enterprise Solutions Corp values growth, innovation, and structural alignment. We are confident that your skill set will be a tremendous asset to the <strong className="text-gray-900">{employee?.department}</strong> team as we continue to expand our operations.
            </p>
            <p>
              Please confirm your acceptance of this offer by signing below and returning this copy to the HR department.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 pt-10 mt-8 border-t border-gray-150">
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-semibold">Authorized Representative</p>
              <div className="h-10 mt-2 flex items-end">
                <span className="font-serif italic text-blue-600 text-lg tracking-wider">Jane Smith</span>
              </div>
              <div className="border-t border-gray-200 pt-1 mt-1">
                <p className="text-xs font-bold text-gray-800">Jane Smith</p>
                <p className="text-[10px] text-gray-500">HR Director</p>
              </div>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-semibold">Employee Acceptance Signature</p>
              <div className="h-10 mt-2 flex items-end">
                <span className="signature-font text-xl text-gray-850 font-semibold">{employee?.name}</span>
              </div>
              <div className="border-t border-gray-200 pt-1 mt-1">
                <p className="text-xs font-bold text-gray-850">{employee?.name}</p>
                <p className="text-[10px] text-gray-500">Candidate</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (selectedDoc.name === 'Direct_Deposit_Form.pdf') {
      return (
        <div className="text-gray-800 font-sans leading-relaxed text-left">
          <div className="border-b-2 border-green-600 pb-4 mb-8 flex justify-between items-end">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-green-600">DIRECT DEPOSIT AUTHORIZATION</h2>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mt-0.5">Finance & Payroll Division</p>
            </div>
            <div className="text-right text-[10px] text-gray-400">
              <p>Enterprise Solutions Corp</p>
              <p>payroll@ems-enterprise.com</p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl mb-6 border border-gray-150">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2 border-b pb-1">Employee Account Information</h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-gray-400 font-semibold uppercase text-[9px]">Employee Name</p>
                <p className="font-bold text-gray-950">{employee?.name}</p>
              </div>
              <div>
                <p className="text-gray-400 font-semibold uppercase text-[9px]">Employee ID</p>
                <p className="font-bold text-gray-950">{employee?.employeeId}</p>
              </div>
              <div>
                <p className="text-gray-400 font-semibold uppercase text-[9px]">Registered Email</p>
                <p className="font-bold text-gray-950">{employee?.email}</p>
              </div>
              <div>
                <p className="text-gray-400 font-semibold uppercase text-[9px]">Department</p>
                <p className="font-bold text-gray-950">{employee?.department}</p>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-xl p-4 mb-6">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2 border-b pb-1">Financial Institution Details</h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-gray-400 font-semibold uppercase text-[9px]">Bank Name</p>
                <p className="font-bold text-gray-850">Enterprise Federal Union</p>
              </div>
              <div>
                <p className="text-gray-400 font-semibold uppercase text-[9px]">Account Type</p>
                <p className="font-bold text-gray-850">Checking Account</p>
              </div>
              <div>
                <p className="text-gray-400 font-semibold uppercase text-[9px]">Routing Number (ABA)</p>
                <p className="font-mono text-gray-800">122408769</p>
              </div>
              <div>
                <p className="text-gray-400 font-semibold uppercase text-[9px]">Account Number</p>
                <p className="font-mono text-gray-800">*********4321</p>
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-600 space-y-3 leading-relaxed mb-8">
            <p>
              I hereby authorize <strong className="text-gray-900">Enterprise Solutions Corp</strong> to initiate electronic credit entries (direct deposit) and, if necessary, credit or debit adjustments for any credit entries made in error, to my checking account listed above.
            </p>
            <p>
              This authorization is to remain in full force and effect until the payroll division has received written notification from me of its termination or amendment, in such time and in such manner as to afford the company a reasonable opportunity to act upon it.
            </p>
          </div>

          <div className="flex justify-between items-end border-t border-gray-150 pt-6">
            <div>
              <p className="text-xs font-bold text-gray-850">Authorized Signature:</p>
              <div className="h-10 flex items-end">
                <span className="signature-font text-2xl text-blue-600 font-semibold">{employee?.name}</span>
              </div>
              <div className="border-t w-56 border-gray-300 mt-1"></div>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-gray-850">Date Signed:</p>
              <p className="text-xs font-semibold text-gray-700 mt-1">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
        </div>
      );
    }

    if (selectedDoc.name === 'Employee_Handbook_2026.pdf') {
      return (
        <div className="text-gray-800 font-sans leading-relaxed text-left">
          <div className="border-b-2 border-indigo-600 pb-4 mb-6 text-center">
            <h2 className="text-xl font-bold tracking-tight text-indigo-600 uppercase">EMPLOYEE HANDBOOK & GUIDELINES</h2>
            <p className="text-[9px] text-gray-500 uppercase tracking-widest font-semibold mt-0.5">Enterprise Solutions Corp • 2026 Edition</p>
          </div>

          <div className="bg-indigo-50 border-l-4 border-indigo-600 p-3 rounded-r-lg mb-6 text-xs text-indigo-900 flex items-center justify-between">
            <span>Welcome to the team, <strong>{employee?.name}</strong>!</span>
            <span className="font-semibold uppercase tracking-wider text-[9px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">Security Tier: {employee?.role}</span>
          </div>

          <div className="space-y-4 text-xs text-gray-700">
            <div>
              <h3 className="font-bold text-gray-900 text-sm border-b pb-0.5 mb-1.5">1. Core Values & Vision</h3>
              <p>
                At Enterprise Solutions Corp, we are committed to engineering next-generation organizational architectures. Our operations are grounded in transparency, technological leadership, and collaborative team structures.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 text-sm border-b pb-0.5 mb-1.5">2. Flexible Work Architecture</h3>
              <p>
                We support a modern hybrid-working framework, allowing staff to collaborate across timezones. Performance is evaluated based on deliverable quality and collaboration metrics, rather than static hours.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 text-sm border-b pb-0.5 mb-1.5">3. Compensation & Health Systems</h3>
              <p>
                Your annual salary tier of <strong className="text-gray-900">${employee?.salary?.toLocaleString() || '0'} USD</strong> qualifies for full company health coverage, payroll direct deposit distribution, and PTO allocations of 25 days annually.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 text-sm border-b pb-0.5 mb-1.5">4. Information Security Guidelines</h3>
              <p>
                As an employee assigned the role level of <strong className="text-gray-900">{employee?.role}</strong> in the <strong className="text-gray-900">{employee?.department}</strong> department, you are expected to maintain strict confidentiality of data assets, client directories, and internal routes. Multi-Factor Authentication is enforced across all endpoints.
              </p>
            </div>
          </div>

          <div className="border-t border-gray-150 pt-6 mt-8 flex justify-between items-center text-[10px] text-gray-400">
            <p>© 2026 Enterprise Solutions Corp. All rights reserved.</p>
            <p>Page 1 of 1</p>
          </div>
        </div>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] bg-transparent dark:bg-dark-bg transition-colors duration-300">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error && !employee) {
    return (
      <div className="p-8 text-center space-y-4 max-w-lg mx-auto mt-20">
        <p className="text-rose-500 font-bold text-lg">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 bg-gray-100 dark:bg-gray-850 hover:bg-gray-200 dark:hover:bg-gray-800 px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Go Back
        </button>
      </div>
    );
  }

  const isEmployeeRole = currentUser?.role === 'Employee';
  const canEdit =
    currentUser?.role === 'Super Admin' ||
    (currentUser?.role === 'HR Manager' && employee?.role !== 'Super Admin') ||
    isOwnProfile;
  const isAdminOrHRCanEdit = canEdit && (currentUser?.role === 'Super Admin' || currentUser?.role === 'HR Manager');

  const mockActivities = [
    { text: 'Profile information updated successfully', date: 'Just now', icon: Save, color: 'text-blue-500 bg-blue-50' },
    { text: 'Logged in from Firefox (Windows 11)', date: '3 hours ago', icon: Clock, color: 'text-slate-500 bg-slate-50' },
    { text: 'Completed Security Settings Verification', date: 'Yesterday', icon: Shield, color: 'text-emerald-500 bg-green-50' },
  ];

  const mockDocuments = [
    { name: 'Offer_Letter.pdf', size: '1.2 MB', category: 'Contract' },
    { name: 'Direct_Deposit_Form.pdf', size: '420 KB', category: 'Finance' },
    { name: 'Employee_Handbook_2026.pdf', size: '3.4 MB', category: 'General' },
  ];

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto bg-transparent transition-colors duration-300">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#64748B] dark:text-gray-400 hover:text-[#0F172A] dark:hover:text-white font-bold transition text-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Directory
        </button>

        {canEdit && (
          !isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 bg-[#2563EB] hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-sm transition text-xs cursor-pointer"
            >
              <Edit className="w-4 h-4" /> Edit Profile
            </button>
          ) : (
            <button
              onClick={() => {
                setIsEditing(false);
                fetchProfile();
              }}
              className="flex items-center gap-2 border border-gray-200 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-gray-800/40 text-[#64748B] dark:text-gray-400 font-bold px-4 py-2.5 rounded-xl transition text-xs cursor-pointer"
            >
              <X className="w-4 h-4" /> Cancel Edit
            </button>
          )
        )}
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 text-[#DC2626] dark:text-red-400 text-xs font-bold px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-xl p-6 shadow-sm text-center flex flex-col items-center justify-center space-y-4 transition-colors duration-300">
          <div className="relative group">
            {profileImage ? (
              <img
                src={profileImage}
                alt={name}
                className="w-28 h-28 rounded-full object-cover border-2 border-blue-500/10"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-[#2563EB] dark:text-blue-400 text-4xl font-black">
                {name.charAt(0)}
              </div>
            )}

            {isEditing && canEdit && (
              <label className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center text-white cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                <Upload className="w-5 h-5" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <div>
            <h2 className="text-xl font-bold text-[#0F172A] dark:text-white">{name}</h2>
            <p className="text-xs text-[#64748B] dark:text-gray-400 font-semibold mt-0.5">{designation}</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <span className="bg-blue-50 dark:bg-blue-950/40 text-[#2563EB] dark:text-blue-400 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              {role}
            </span>
            <span
              className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border ${status === 'Active'
                  ? 'bg-green-50 dark:bg-green-950/20 text-[#16A34A] dark:text-green-400 border-green-100/50 dark:border-green-900/30'
                  : 'bg-red-50 dark:bg-red-950/20 text-[#DC2626] dark:text-red-400 border-red-100/50 dark:border-red-900/30'
                }`}
            >
              {status}
            </span>
          </div>

          <div className="w-full border-t border-gray-50 dark:border-dark-border pt-4 text-left space-y-3.5 text-xs text-[#64748B] dark:text-gray-400">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#64748B] dark:text-gray-400 uppercase text-[9px] tracking-wider">Employee ID</span>
              <span className="font-bold text-[#0F172A] dark:text-white">{employee?.employeeId}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#64748B] dark:text-gray-400 uppercase text-[9px] tracking-wider">Department</span>
              <span className="font-semibold text-[#0F172A] dark:text-white">{department}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#64748B] dark:text-gray-400 uppercase text-[9px] tracking-wider">Reporting Manager</span>
              <span className="font-semibold text-[#0F172A] dark:text-white">
                {employee?.reportingManager?.name || 'CEO / Root'}
              </span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-xl p-8 shadow-sm space-y-6 transition-colors duration-300">
          <div className="flex border-b border-gray-100 dark:border-dark-border pb-3 gap-6">
            {(['overview', 'reporting', 'activity', 'documents'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`text-xs font-bold uppercase tracking-wider pb-2 relative transition-all cursor-pointer ${activeTab === tab
                    ? 'text-[#2563EB] dark:text-blue-400'
                    : 'text-[#64748B] dark:text-gray-400 hover:text-[#0F172A] dark:hover:text-white'
                  }`}
              >
                {tab}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2563EB] dark:bg-blue-400 rounded-full"></span>
                )}
              </button>
            ))}
          </div>

          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#64748B] dark:text-gray-400 uppercase tracking-wider">Full Name</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#64748B] dark:text-gray-400">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      required
                      disabled={!isEditing || !isAdminOrHRCanEdit}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-gray-55/20 dark:bg-dark-bg/20 border border-gray-200 dark:border-dark-border rounded-xl py-2.5 pl-10 pr-4 text-sm text-[#0F172A] dark:text-white disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:border-[#2563EB] dark:focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#64748B] dark:text-gray-400 uppercase tracking-wider">Email Address</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#64748B] dark:text-gray-400">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      required
                      disabled={!isEditing || !isAdminOrHRCanEdit}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-gray-55/20 dark:bg-dark-bg/20 border border-gray-200 dark:border-dark-border rounded-xl py-2.5 pl-10 pr-4 text-sm text-[#0F172A] dark:text-white disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:border-[#2563EB] dark:focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#64748B] dark:text-gray-400 uppercase tracking-wider">Phone Number</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#64748B] dark:text-gray-400">
                      <Phone className="w-4 h-4" />
                    </span>
                    <input
                      type="tel"
                      required
                      disabled={!isEditing || !canEdit}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-gray-55/20 dark:bg-dark-bg/20 border border-gray-200 dark:border-dark-border rounded-xl py-2.5 pl-10 pr-4 text-sm text-[#0F172A] dark:text-white disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:border-[#2563EB] dark:focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#64748B] dark:text-gray-400 uppercase tracking-wider">Designation</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#64748B] dark:text-gray-400">
                      <Briefcase className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      required
                      disabled={!isEditing || !isAdminOrHRCanEdit}
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      className="w-full bg-gray-55/20 dark:bg-dark-bg/20 border border-gray-200 dark:border-dark-border rounded-xl py-2.5 pl-10 pr-4 text-sm text-[#0F172A] dark:text-white disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:border-[#2563EB] dark:focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#64748B] dark:text-gray-400 uppercase tracking-wider">Department</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#64748B] dark:text-gray-400">
                      <Layers className="w-4 h-4" />
                    </span>
                    <select
                      disabled={!isEditing || !isAdminOrHRCanEdit}
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full bg-gray-55/20 dark:bg-dark-bg/20 border border-gray-200 dark:border-dark-border rounded-xl py-2.5 pl-10 pr-4 text-sm text-[#0F172A] dark:text-white disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:border-[#2563EB] dark:focus:border-blue-500"
                    >
                      <option value="Engineering" className="dark:bg-dark-card">Engineering</option>
                      <option value="Human Resources" className="dark:bg-dark-card">Human Resources</option>
                      <option value="Product" className="dark:bg-dark-card">Product</option>
                      <option value="Marketing" className="dark:bg-dark-card">Marketing</option>
                      <option value="Sales" className="dark:bg-dark-card">Sales</option>
                      <option value="Executive" className="dark:bg-dark-card">Executive</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#64748B] dark:text-gray-400 uppercase tracking-wider">Annual Salary ($)</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#64748B] dark:text-gray-400">
                      <DollarSign className="w-4 h-4" />
                    </span>
                    <input
                      type="number"
                      required
                      disabled={!isEditing || !isAdminOrHRCanEdit}
                      value={salary}
                      onChange={(e) => setSalary(parseFloat(e.target.value) || 0)}
                      className="w-full bg-gray-55/20 dark:bg-dark-bg/20 border border-gray-200 dark:border-dark-border rounded-xl py-2.5 pl-10 pr-4 text-sm text-[#0F172A] dark:text-white disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:border-[#2563EB] dark:focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#64748B] dark:text-gray-400 uppercase tracking-wider">Joining Date</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#64748B] dark:text-gray-400">
                      <Calendar className="w-4 h-4" />
                    </span>
                    <input
                      type="date"
                      required
                      disabled={!isEditing || !isAdminOrHRCanEdit}
                      value={joiningDate}
                      onChange={(e) => setJoiningDate(e.target.value)}
                      className="w-full bg-gray-55/20 dark:bg-dark-bg/20 border border-gray-200 dark:border-dark-border rounded-xl py-2.5 pl-10 pr-4 text-sm text-[#0F172A] dark:text-white disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:border-[#2563EB] dark:focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#64748B] dark:text-gray-400 uppercase tracking-wider">Security Access Role</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#64748B] dark:text-gray-400">
                      <Shield className="w-4 h-4" />
                    </span>
                    <select
                      disabled={!isEditing || !isAdminOrHRCanEdit || currentUser?.role !== 'Super Admin'}
                      value={role}
                      onChange={(e) => setRole(e.target.value as any)}
                      className="w-full bg-gray-55/20 dark:bg-dark-bg/20 border border-gray-200 dark:border-dark-border rounded-xl py-2.5 pl-10 pr-4 text-sm text-[#0F172A] dark:text-white disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:border-[#2563EB] dark:focus:border-blue-500"
                    >
                      <option value="Employee" className="dark:bg-dark-card">Employee</option>
                      <option value="HR Manager" className="dark:bg-dark-card">HR Manager</option>
                      <option value="Super Admin" className="dark:bg-dark-card">Super Admin</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#64748B] dark:text-gray-400 uppercase tracking-wider">Account Status</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#64748B] dark:text-gray-400">
                      <ActivityIcon className="w-4 h-4" />
                    </span>
                    <select
                      disabled={!isEditing || !isAdminOrHRCanEdit}
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full bg-gray-55/20 dark:bg-dark-bg/20 border border-gray-200 dark:border-dark-border rounded-xl py-2.5 pl-10 pr-4 text-sm text-[#0F172A] dark:text-white disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:border-[#2563EB] dark:focus:border-blue-500"
                    >
                      <option value="Active" className="dark:bg-dark-card">Active</option>
                      <option value="Inactive" className="dark:bg-dark-card">Inactive</option>
                    </select>
                  </div>
                </div>

                {isEditing && (
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#64748B] dark:text-gray-400 uppercase tracking-wider">
                      Password (leave empty to keep current)
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-gray-55/20 dark:bg-dark-bg/20 border border-gray-200 dark:border-dark-border rounded-xl py-2.5 px-4 text-sm text-[#0F172A] dark:text-white focus:outline-none focus:border-[#2563EB] dark:focus:border-blue-500"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'reporting' && (
            <div className="space-y-6">
              <div className="space-y-4 max-w-md">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#64748B] dark:text-gray-400 uppercase tracking-wider">Reporting Manager</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#64748B] dark:text-gray-400">
                      <Network className="w-4 h-4" />
                    </span>
                    <select
                      disabled={!isEditing || isEmployeeRole || currentUser?.role !== 'Super Admin'}
                      value={reportingManager}
                      onChange={(e) => setReportingManager(e.target.value)}
                      className="w-full bg-gray-55/20 dark:bg-dark-bg/20 border border-gray-200 dark:border-dark-border rounded-xl py-2.5 pl-10 pr-4 text-sm text-[#0F172A] dark:text-white disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:border-[#2563EB] dark:focus:border-blue-500"
                    >
                      <option value="" className="dark:bg-dark-card">None (Top-Level / CEO)</option>
                      {allManagers
                        .filter((m) => m._id !== targetId)
                        .map((m) => (
                          <option key={m._id} value={m._id}>
                            {m.name} ({m.designation})
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-4 space-y-4">
                <h4 className="font-bold text-[#0F172A] dark:text-white flex items-center gap-2 text-sm border-b border-gray-50 dark:border-dark-border pb-2">
                  <UserCheck className="w-4 h-4 text-[#16A34A] dark:text-green-400" />
                  <span>Direct Reportees ({reportees.length})</span>
                </h4>
                {reportees.length === 0 ? (
                  <p className="text-xs text-[#64748B] dark:text-gray-400 italic">No reporting team members found.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {reportees.map((rep) => (
                      <div
                        key={rep._id}
                        onClick={() => navigate(`/profile?id=${rep._id}`)}
                        className="flex items-center gap-3 p-3 bg-gray-50/40 dark:bg-dark-bg/20 border border-gray-100 dark:border-dark-border rounded-xl cursor-pointer hover:border-blue-500/20 dark:hover:border-blue-500/40 transition-all shadow-sm"
                      >
                        {rep.profileImage ? (
                          <img
                            src={rep.profileImage}
                            alt={rep.name}
                            className="w-9 h-9 rounded-full object-cover border border-gray-100 dark:border-dark-border"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-955 flex items-center justify-center text-[#2563EB] dark:text-blue-400 font-bold text-xs">
                            {rep.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-xs text-[#0F172A] dark:text-white">{rep.name}</p>
                          <p className="text-[10px] text-[#64748B] dark:text-gray-400 font-semibold">{rep.designation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-6">
              <h4 className="font-bold text-[#0F172A] dark:text-white text-sm border-b border-gray-50 dark:border-dark-border pb-2">Audit Log Activity Trail</h4>
              <div className="space-y-4 relative pl-4 border-l border-gray-100 dark:border-dark-border py-2">
                {mockActivities.map((act, i) => {
                  const Icon = act.icon;
                  return (
                    <div key={i} className="relative space-y-1">
                      <span className={`absolute -left-7 top-1 p-1 rounded-full ${act.color} dark:bg-dark-bg`}>
                        <Icon className="w-3.5 h-3.5" />
                      </span>
                      <p className="text-xs font-bold text-[#0F172A] dark:text-white">{act.text}</p>
                      <span className="text-[10px] text-[#64748B] dark:text-gray-400 font-semibold">{act.date}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-4">
              <h4 className="font-bold text-[#0F172A] dark:text-white text-sm border-b border-gray-50 dark:border-dark-border pb-2">Employee Documentation Files</h4>
              <div className="space-y-3">
                {mockDocuments.map((doc, i) => (
                  <div
                    key={i}
                    onClick={() => setSelectedDoc(doc)}
                    className="flex items-center justify-between p-3.5 border border-gray-100 dark:border-dark-border rounded-xl bg-white dark:bg-dark-card hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 text-[#2563EB] dark:text-blue-400 rounded-lg group-hover:scale-105 transition-transform">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#0F172A] dark:text-white group-hover:text-[#2563EB] dark:group-hover:text-blue-400 transition-colors">{doc.name}</p>
                        <span className="text-[10px] text-[#64748B] dark:text-gray-400 font-semibold">{doc.size} • {doc.category}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-[#64748B] dark:text-gray-400 hover:text-[#0F172A] dark:hover:text-white rounded-lg transition-all"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isEditing && canEdit && activeTab === 'overview' && (
            <div className="flex items-center justify-end pt-4 border-t border-gray-50 dark:border-dark-border">
              <button
                type="submit"
                disabled={saving}
                className="bg-[#2563EB] hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition disabled:opacity-60 text-xs cursor-pointer"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save Overview Changes</span>
              </button>
            </div>
          )}
        </div>
      </form>

      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <style>{`
              @import url('https://fonts.googleapis.com/css2?family=Alex+Brush&display=swap');
              .signature-font {
                font-family: 'Alex Brush', cursive;
              }
            `}</style>

            <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-950/40 text-blue-400 rounded-lg">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{selectedDoc.name}</h3>
                  <p className="text-[10px] text-slate-400 font-semibold">{selectedDoc.size} • Dynamic Generated Document</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handlePrint(selectedDoc.name)}
                  className="flex items-center gap-2 bg-[#2563EB] hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  Print / Download PDF
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDoc(null)}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 bg-slate-950/10 flex justify-center items-start">
              <div
                id="pdf-preview-sheet"
                className="w-full max-w-2xl bg-white p-12 md:p-16 shadow-lg rounded-lg border border-gray-200 aspect-[1/1.414]"
              >
                {renderDocPreview()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
