import { Employee } from '@prisma/client';

export type IEmployee = Employee;

export const mapEmployee = (emp: any): any => {
  if (!emp) return null;
  const mapped = {
    ...emp,
    _id: emp.id,
  };
  
  if (emp.reportingManager) {
    mapped.reportingManager = {
      _id: emp.reportingManager.id,
      name: emp.reportingManager.name,
      designation: emp.reportingManager.designation,
      email: emp.reportingManager.email,
    };
  }
  
  delete mapped.password;
  return mapped;
};

export const mapEmployees = (emps: any[]): any[] => {
  return emps.map(mapEmployee);
};
