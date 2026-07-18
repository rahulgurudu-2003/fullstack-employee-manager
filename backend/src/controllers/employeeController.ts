import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/db';
import { mapEmployee, mapEmployees } from '../models/Employee';
import { AuthRequest } from '../middleware/auth';

const checkCircularReporting = async (employeeId: string, managerId: string): Promise<boolean> => {
  if (employeeId === managerId) return true;
  let currentManagerId: string | null = managerId;
  while (currentManagerId) {
    const mgr: any = await prisma.employee.findUnique({
      where: { id: currentManagerId },
    });
    if (!mgr) break;
    if (mgr.id === employeeId) {
      return true;
    }
    currentManagerId = mgr.reportingManagerId;
  }
  return false;
};

export const getEmployees = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      search,
      department,
      role,
      status,
      isManager,
      sortBy = 'name',
      sortOrder = 'asc',
      page = 1,
      limit = 10,
    } = req.query;

    const where: any = { isDeleted: false };

    if (search) {
      const searchStr = String(search).trim();
      where.OR = [
        { name: { contains: searchStr, mode: 'insensitive' } },
        { email: { contains: searchStr, mode: 'insensitive' } },
        { employeeId: { contains: searchStr, mode: 'insensitive' } },
      ];
    }

    if (department) where.department = String(department);
    if (role) where.role = String(role);
    if (status) where.status = String(status);
    if (isManager === 'true') {
      where.reportees = {
        some: {
          isDeleted: false,
        },
      };
    }

    const orderBy: any = {};
    if (sortBy === 'name' || sortBy === 'employeeId' || sortBy === 'email' || sortBy === 'joiningDate' || sortBy === 'salary') {
      orderBy[sortBy as string] = sortOrder === 'desc' ? 'desc' : 'asc';
    } else {
      orderBy.name = 'asc';
    }

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const [total, employees] = await Promise.all([
      prisma.employee.count({ where }),
      prisma.employee.findMany({
        where,
        orderBy,
        skip,
        take: limitNum,
        include: {
          reportingManager: true,
        },
      }),
    ]);

    res.status(200).json({
      status: 'success',
      results: employees.length,
      total,
      pages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: {
        employees: mapEmployees(employees),
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getEmployee = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const employee = await prisma.employee.findFirst({
      where: { id: req.params.id, isDeleted: false },
      include: {
        reportingManager: true,
      },
    });

    if (!employee) {
      res.status(404).json({ message: 'Employee not found' });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: {
        employee: mapEmployee(employee),
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const createEmployee = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      employeeId,
      name,
      email,
      phone,
      department,
      designation,
      salary,
      joiningDate,
      status,
      role = 'Employee',
      reportingManager,
      profileImage,
      password,
    } = req.body;

    if (role === 'Super Admin' && req.user?.role !== 'Super Admin') {
      res.status(403).json({ message: 'HR Managers cannot create or assign Super Admin roles' });
      return;
    }

    const existingId = await prisma.employee.findUnique({
      where: { employeeId },
    });
    if (existingId) {
      res.status(400).json({ message: `Employee ID ${employeeId} already exists` });
      return;
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const existingEmail = await prisma.employee.findUnique({
      where: { email: normalizedEmail },
    });
    if (existingEmail) {
      res.status(400).json({ message: `Email ${email} is already in use` });
      return;
    }

    let validManager: string | null = null;
    if (reportingManager) {
      const manager = await prisma.employee.findUnique({
        where: { id: reportingManager },
      });
      if (!manager || manager.isDeleted) {
        res.status(400).json({ message: 'Reporting manager does not exist' });
        return;
      }
      validManager = reportingManager;
    }

    const defaultPassword = password || 'Ems@123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(defaultPassword, salt);

    const newEmployee = await prisma.employee.create({
      data: {
        employeeId,
        name,
        email: normalizedEmail,
        phone,
        department,
        designation,
        salary: parseFloat(salary),
        joiningDate: joiningDate ? new Date(joiningDate) : new Date(),
        status: status || 'Active',
        role,
        reportingManagerId: validManager,
        profileImage: profileImage || '',
        password: hashedPassword,
      },
      include: {
        reportingManager: true,
      },
    });

    res.status(201).json({
      status: 'success',
      data: {
        employee: mapEmployee(newEmployee),
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateEmployee = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const currentUser = req.user;

    if (!currentUser) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const targetEmployee = await prisma.employee.findFirst({
      where: { id, isDeleted: false },
    });
    if (!targetEmployee) {
      res.status(404).json({ message: 'Employee not found' });
      return;
    }

    const {
      name,
      email,
      phone,
      department,
      designation,
      salary,
      joiningDate,
      status,
      role,
      reportingManager,
      profileImage,
      password,
    } = req.body;

    if (currentUser.role === 'Employee') {
      if (currentUser.id !== id) {
        res.status(403).json({ message: 'Employees can only edit their own profile' });
        return;
      }

      if (
        name !== undefined ||
        department !== undefined ||
        designation !== undefined ||
        salary !== undefined ||
        joiningDate !== undefined ||
        status !== undefined ||
        role !== undefined ||
        reportingManager !== undefined
      ) {
        res.status(403).json({ message: 'Employees can only update phone, email, password, and profile image' });
        return;
      }
    }

    if (currentUser.role === 'HR Manager') {
      if (role === 'Super Admin' || targetEmployee.role === 'Super Admin') {
        res.status(403).json({ message: 'HR Managers cannot create or assign Super Admin roles' });
        return;
      }
    }

    const updateData: any = {};

    if (email && email.toLowerCase().trim() !== targetEmployee.email) {
      const normalizedEmail = email.toLowerCase().trim();
      const existingEmail = await prisma.employee.findFirst({
        where: {
          email: normalizedEmail,
          NOT: { id },
        },
      });
      if (existingEmail) {
        res.status(400).json({ message: `Email ${email} is already in use` });
        return;
      }
      updateData.email = normalizedEmail;
    }

    if (reportingManager !== undefined) {
      if (reportingManager === null || reportingManager === '') {
        updateData.reportingManagerId = null;
      } else {
        const isCircular = await checkCircularReporting(id, reportingManager);
        if (isCircular) {
          res.status(400).json({ message: 'Cannot assign manager. Circular reporting chain detected.' });
          return;
        }
        updateData.reportingManagerId = reportingManager;
      }
    }

    if (name !== undefined && currentUser.role !== 'Employee') updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (department !== undefined && currentUser.role !== 'Employee') updateData.department = department;
    if (designation !== undefined && currentUser.role !== 'Employee') updateData.designation = designation;
    if (salary !== undefined && currentUser.role !== 'Employee') updateData.salary = parseFloat(salary);
    if (joiningDate !== undefined && currentUser.role !== 'Employee') updateData.joiningDate = new Date(joiningDate);
    if (status !== undefined && currentUser.role !== 'Employee') updateData.status = status;
    if (role !== undefined && currentUser.role !== 'Employee') updateData.role = role;
    if (profileImage !== undefined) updateData.profileImage = profileImage;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const updatedEmployee = await prisma.employee.update({
      where: { id },
      data: updateData,
      include: {
        reportingManager: true,
      },
    });

    res.status(200).json({
      status: 'success',
      data: {
        employee: mapEmployee(updatedEmployee),
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteEmployee = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const targetEmployee = await prisma.employee.findUnique({
      where: { id },
    });
    if (!targetEmployee || targetEmployee.isDeleted) {
      res.status(404).json({ message: 'Employee not found' });
      return;
    }

    if (targetEmployee.role === 'Super Admin') {
      const superAdminCount = await prisma.employee.count({
        where: { role: 'Super Admin', isDeleted: false },
      });
      if (superAdminCount <= 1) {
        res.status(400).json({ message: 'Cannot delete the only remaining Super Admin' });
        return;
      }
    }

    await prisma.employee.update({
      where: { id },
      data: {
        isDeleted: true,
        status: 'Inactive',
      },
    });

    await prisma.employee.updateMany({
      where: { reportingManagerId: id },
      data: { reportingManagerId: null },
    });

    res.status(200).json({
      status: 'success',
      message: 'Employee deleted (soft-delete) successfully',
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const patchManager = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { reportingManager } = req.body;

    const employee = await prisma.employee.findFirst({
      where: { id, isDeleted: false },
    });
    if (!employee) {
      res.status(404).json({ message: 'Employee not found' });
      return;
    }

    const updateData: any = {};
    if (reportingManager) {
      const isCircular = await checkCircularReporting(id, reportingManager);
      if (isCircular) {
        res.status(400).json({ message: 'Circular reporting chain detected.' });
        return;
      }
      updateData.reportingManagerId = reportingManager;
    } else {
      updateData.reportingManagerId = null;
    }

    const updated = await prisma.employee.update({
      where: { id },
      data: updateData,
      include: {
        reportingManager: true,
      },
    });

    res.status(200).json({
      status: 'success',
      data: {
        employee: mapEmployee(updated),
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getReportees = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const reportees = await prisma.employee.findMany({
      where: { reportingManagerId: id, isDeleted: false },
    });

    res.status(200).json({
      status: 'success',
      results: reportees.length,
      data: {
        reportees: mapEmployees(reportees),
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const importCSV = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { csvData } = req.body;

    if (!csvData) {
      res.status(400).json({ message: 'Please provide CSV data text in req.body.csvData' });
      return;
    }

    const rows = csvData.split('\n').map((row: string) => row.trim()).filter(Boolean);
    if (rows.length < 2) {
      res.status(400).json({ message: 'CSV data is empty or missing headers' });
      return;
    }

    const headers = rows[0].split(',').map((h: string) => h.trim().replace(/^["']|["']$/g, ''));
    const results = [];
    const errorsList = [];
    const defaultPassword = 'Ems@123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(defaultPassword, salt);

    for (let i = 1; i < rows.length; i++) {
      const values = rows[i].split(',').map((v: string) => v.trim().replace(/^["']|["']$/g, ''));
      if (values.length < headers.length) {
        errorsList.push(`Row ${i + 1}: incomplete data columns`);
        continue;
      }

      const item: any = {};
      headers.forEach((header: string, index: number) => {
        item[header] = values[index];
      });

      const { employeeId, name, email, phone, department, designation, salary, joiningDate, status, role, reportingManagerId } = item;

      if (!employeeId || !name || !email || !phone || !department || !designation || !salary) {
        errorsList.push(`Row ${i + 1}: Missing required fields`);
        continue;
      }

      const normalizedEmail = String(email).toLowerCase().trim();
      const duplicate = await prisma.employee.findFirst({
        where: {
          OR: [
            { employeeId },
            { email: normalizedEmail },
          ],
        },
      });
      if (duplicate) {
        errorsList.push(`Row ${i + 1}: Employee ID (${employeeId}) or Email (${email}) already exists`);
        continue;
      }

      let validManagerId: string | null = null;
      if (reportingManagerId) {
        const manager = await prisma.employee.findUnique({
          where: { employeeId: reportingManagerId },
        });
        if (manager && !manager.isDeleted) {
          validManagerId = manager.id;
        }
      }

      try {
        const created = await prisma.employee.create({
          data: {
            employeeId,
            name,
            email: normalizedEmail,
            phone,
            department,
            designation,
            salary: parseFloat(salary),
            joiningDate: joiningDate ? new Date(joiningDate) : new Date(),
            status: status || 'Active',
            role: role || 'Employee',
            reportingManagerId: validManagerId,
            password: hashedPassword,
          },
        });
        results.push(mapEmployee(created));
      } catch (err: any) {
        errorsList.push(`Row ${i + 1}: Create failed (${err.message})`);
      }
    }

    res.status(200).json({
      status: 'success',
      importedCount: results.length,
      errors: errorsList,
      data: {
        imported: results,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
