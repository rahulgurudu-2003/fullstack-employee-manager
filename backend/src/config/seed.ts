import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { prisma } from './db';

dotenv.config();

const seedDB = async () => {
  try {
    console.log('Connecting to database and clearing existing data...');
    await prisma.employee.deleteMany({});
    console.log('Cleared existing employees.');

    const adminHash = await bcrypt.hash('Admin@123', 10);
    const hrHash = await bcrypt.hash('HRManager@123', 10);
    const empHash = await bcrypt.hash('Employee@123', 10);

    const superAdmin = await prisma.employee.create({
      data: {
        employeeId: 'EMP-001',
        name: 'John Doe',
        email: 'admin@ems.com',
        phone: '1234567890',
        department: 'Executive',
        designation: 'Chief Executive Officer',
        salary: 180000,
        joiningDate: new Date('2022-01-15'),
        status: 'Active',
        role: 'Super Admin',
        password: adminHash,
        profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      },
    });
    console.log('Seeded Super Admin.');

    const hrManager = await prisma.employee.create({
      data: {
        employeeId: 'EMP-002',
        name: 'Jane Smith',
        email: 'hr@ems.com',
        phone: '9876543210',
        department: 'Human Resources',
        designation: 'HR Director',
        salary: 95000,
        joiningDate: new Date('2023-02-10'),
        status: 'Active',
        role: 'HR Manager',
        reportingManagerId: superAdmin.id,
        password: hrHash,
        profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
      },
    });
    console.log('Seeded HR Manager.');

    const engManager = await prisma.employee.create({
      data: {
        employeeId: 'EMP-003',
        name: 'Robert Johnson',
        email: 'bob@ems.com',
        phone: '5551234567',
        department: 'Engineering',
        designation: 'Engineering Lead',
        salary: 140000,
        joiningDate: new Date('2022-06-01'),
        status: 'Active',
        role: 'HR Manager',
        reportingManagerId: superAdmin.id,
        password: empHash,
        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      },
    });
    console.log('Seeded Engineering Lead.');

    await prisma.employee.create({
      data: {
        employeeId: 'EMP-004',
        name: 'Alice Williams',
        email: 'alice@ems.com',
        phone: '5557654321',
        department: 'Engineering',
        designation: 'Senior Developer',
        salary: 110000,
        joiningDate: new Date('2023-08-15'),
        status: 'Active',
        role: 'Employee',
        reportingManagerId: engManager.id,
        password: empHash,
        profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      },
    });

    await prisma.employee.create({
      data: {
        employeeId: 'EMP-005',
        name: 'Charlie Brown',
        email: 'charlie@ems.com',
        phone: '5559876543',
        department: 'Engineering',
        designation: 'QA Automation Engineer',
        salary: 75000,
        joiningDate: new Date('2024-01-20'),
        status: 'Active',
        role: 'Employee',
        reportingManagerId: engManager.id,
        password: empHash,
        profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      },
    });

    await prisma.employee.create({
      data: {
        employeeId: 'EMP-006',
        name: 'Diana Prince',
        email: 'diana@ems.com',
        phone: '5552345678',
        department: 'Human Resources',
        designation: 'Talent Acquisition',
        salary: 65000,
        joiningDate: new Date('2023-11-01'),
        status: 'Active',
        role: 'Employee',
        reportingManagerId: hrManager.id,
        password: empHash,
        profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
      },
    });

    const emp4 = await prisma.employee.create({
      data: {
        employeeId: 'EMP-007',
        name: 'Clark Kent',
        email: 'clark@ems.com',
        phone: '5558765432',
        department: 'Product',
        designation: 'Product Manager',
        salary: 115000,
        joiningDate: new Date('2023-05-12'),
        status: 'Active',
        role: 'Employee',
        reportingManagerId: superAdmin.id,
        password: empHash,
        profileImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
      },
    });

    await prisma.employee.create({
      data: {
        employeeId: 'EMP-008',
        name: 'Sarah Connor',
        email: 'employee@ems.com',
        phone: '5553456789',
        department: 'Product',
        designation: 'UI/UX Designer',
        salary: 85000,
        joiningDate: new Date('2024-03-10'),
        status: 'Active',
        role: 'Employee',
        reportingManagerId: emp4.id,
        password: empHash,
        profileImage: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=150&h=150&fit=crop&crop=face',
      },
    });

    console.log('Seeded standard employees.');
    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();
