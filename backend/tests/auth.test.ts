import request from 'supertest';
import bcrypt from 'bcryptjs';
import app from '../src/app';
import { prisma } from '../src/config/db';

// Mock the db file to prevent real PostgreSQL connection during tests
jest.mock('../src/config/db', () => {
  return {
    prisma: {
      employee: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
      },
    },
    connectDB: jest.fn().mockResolvedValue(null),
  };
});

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 200 and a token when valid credentials are provided', async () => {
    const mockEmployee = {
      id: 'mock-uuid',
      employeeId: 'EMP-001',
      name: 'John Doe',
      email: 'admin@ems.com',
      phone: '1234567890',
      department: 'Executive',
      designation: 'CEO',
      salary: 100000,
      joiningDate: new Date(),
      status: 'Active',
      role: 'Super Admin',
      password: 'hashedpassword123',
      profileImage: '',
      isDeleted: false,
    };

    // Mock prisma to return our mock employee
    (prisma.employee.findFirst as jest.Mock).mockResolvedValue(mockEmployee);
    
    // Mock bcrypt to return true for password match
    jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@ems.com', password: 'Admin@123' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.token).toBeDefined();
    expect(res.body.data.employee.email).toBe('admin@ems.com');
  });

  it('should return 401 for invalid credentials', async () => {
    // Mock prisma to return null (user not found)
    (prisma.employee.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'unknown@ems.com', password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid credentials');
  });

  it('should return 403 if user account is inactive', async () => {
    const mockInactiveEmployee = {
      id: 'mock-uuid',
      email: 'inactive@ems.com',
      status: 'Inactive',
      isDeleted: false,
      password: 'hashedpassword123',
    };

    (prisma.employee.findFirst as jest.Mock).mockResolvedValue(mockInactiveEmployee);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'inactive@ems.com', password: 'password123' });

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Account is inactive. Contact admin.');
  });
});
