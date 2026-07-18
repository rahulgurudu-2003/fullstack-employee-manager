import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Layers, User, Users, Briefcase } from 'lucide-react';

interface DepartmentData {
  name: string;
  head: string;
  employeeCount: number;
}

const Departments: React.FC = () => {
  const { token } = useAuth();
  const [departments, setDepartments] = useState<DepartmentData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch('/api/employees?limit=1000', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const result = await response.json();
          const list = result.data.employees;

          const deptMap: { [key: string]: { name: string; employees: any[] } } = {};
          list.forEach((emp: any) => {
            if (emp.department) {
              if (!deptMap[emp.department]) {
                deptMap[emp.department] = { name: emp.department, employees: [] };
              }
              deptMap[emp.department].employees.push(emp);
            }
          });

          const deptList: DepartmentData[] = Object.keys(deptMap).map((key) => {
            const dept = deptMap[key];
            const headEmp = dept.employees.find((emp: any) => 
              /lead|manager|chief|director|head/i.test(emp.designation)
            ) || dept.employees[0];

            return {
              name: key,
              head: headEmp ? headEmp.name : 'N/A',
              employeeCount: dept.employees.length,
            };
          });

          setDepartments(deptList);
        }
      } catch (err) {
        console.error('Failed to load departments', err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchEmployees();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] bg-transparent dark:bg-dark-bg transition-colors duration-300">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto bg-transparent transition-colors duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white">Departments</h1>
          <p className="text-sm text-[#64748B] dark:text-gray-400">Overview of active departments, team headcounts, and leadership roles.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {departments.map((dept, i) => (
          <div key={i} className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-[#2563EB] dark:text-blue-400">
                  <Layers className="w-3.5 h-3.5" />
                  Department
                </span>
                <h3 className="text-xl font-bold text-[#0F172A] dark:text-white pt-1">{dept.name}</h3>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-[#2563EB] dark:text-blue-400 rounded-xl">
                <Briefcase className="w-5 h-5" />
              </div>
            </div>

            <div className="border-t border-gray-50 dark:border-dark-border mt-6 pt-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#64748B] dark:text-gray-400 flex items-center gap-2">
                  <User className="w-4 h-4" /> Head / Manager:
                </span>
                <span className="font-semibold text-[#0F172A] dark:text-white">{dept.head}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#64748B] dark:text-gray-400 flex items-center gap-2">
                  <Users className="w-4 h-4" /> Team Size:
                </span>
                <span className="font-bold text-[#2563EB] dark:text-blue-450">{dept.employeeCount} Members</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Departments;
