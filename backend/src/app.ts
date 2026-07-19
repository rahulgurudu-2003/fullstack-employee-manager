import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, prisma } from './config/db';
import { execSync } from 'child_process';
import authRoutes from './routes/authRoutes';
import employeeRoutes from './routes/employeeRoutes';
import organizationRoutes from './routes/organizationRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/organization', organizationRoutes);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err : {},
  });
});

const startServer = async () => {
  await connectDB();

  // Run Prisma database push and seeding automatically on startup in production
  if (process.env.NODE_ENV === 'production') {
    try {
      console.log('Running automatic database schema sync (Prisma)...');
      execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
      
      const count = await prisma.employee.count();
      if (count === 0) {
        console.log('No employees found. Seeding initial accounts...');
        execSync('node dist/config/seed.js', { stdio: 'inherit' });
      }
    } catch (error: any) {
      console.error('Automatic database setup failed:', error.message);
    }
  }

  app.listen(PORT, () => {
    console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;
