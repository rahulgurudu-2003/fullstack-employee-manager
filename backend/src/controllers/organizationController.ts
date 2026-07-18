import { Response } from 'express';
import { prisma } from '../config/db';
import { AuthRequest } from '../middleware/auth';

export const getOrgTree = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const employees = await prisma.employee.findMany({
      where: { isDeleted: false },
    });

    const map = new Map<string, any>();
    const roots: any[] = [];

    employees.forEach((emp: any) => {
      map.set(emp.id, {
        _id: emp.id,
        id: emp.id,
        employeeId: emp.employeeId,
        name: emp.name,
        email: emp.email,
        phone: emp.phone,
        department: emp.department,
        designation: emp.designation,
        role: emp.role,
        status: emp.status,
        profileImage: emp.profileImage,
        children: [],
      });
    });

    employees.forEach((emp: any) => {
      const node = map.get(emp.id);
      if (emp.reportingManagerId && map.has(emp.reportingManagerId)) {
        const parentNode = map.get(emp.reportingManagerId);
        parentNode.children.push(node);
      } else {
        roots.push(node);
      }
    });

    res.status(200).json({
      status: 'success',
      data: {
        tree: roots,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const employees = await prisma.employee.findMany({
      where: { isDeleted: false },
    });

    const total = employees.length;
    const active = employees.filter((e) => e.status === 'Active').length;
    const inactive = total - active;

    const departments = Array.from(new Set(employees.map((e) => e.department).filter(Boolean)));
    const departmentCount = departments.length;

    const deptDistributionMap: { [key: string]: number } = {};
    employees.forEach((e) => {
      if (e.department) {
        deptDistributionMap[e.department] = (deptDistributionMap[e.department] || 0) + 1;
      }
    });
    const deptDistribution = Object.keys(deptDistributionMap).map((dept) => ({
      name: dept,
      value: deptDistributionMap[dept],
    }));

    const roleDistributionMap: { [key: string]: number } = {};
    employees.forEach((e) => {
      if (e.role) {
        roleDistributionMap[e.role] = (roleDistributionMap[e.role] || 0) + 1;
      }
    });
    const roleDistribution = Object.keys(roleDistributionMap).map((role) => ({
      name: role,
      value: roleDistributionMap[role],
    }));

    const statusDistribution = [
      { name: 'Active', value: active },
      { name: 'Inactive', value: inactive },
    ];

    res.status(200).json({
      status: 'success',
      data: {
        total,
        active,
        inactive,
        departmentCount,
        deptDistribution,
        roleDistribution,
        statusDistribution,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
