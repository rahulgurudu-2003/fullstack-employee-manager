import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });

export const connectDB = async () => {
  try {
    await pool.query('SELECT 1');
    console.log('PostgreSQL connected successfully via Prisma');
  } catch (error: any) {
    console.error('Database connection failed. Please make sure PostgreSQL is running.');
    console.error(`Error details: ${error.message}`);
    process.exit(1);
  }
};
