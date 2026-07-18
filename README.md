# Employee Management System (EMS)

An enterprise-grade, full-stack Employee Management System featuring secure JWT-based authentication, role-based access control (RBAC), organizational reporting tree visualization, and detailed department analytics.

---

## 🚀 Key Features

*   **Secure Authentication**: Stateful JWT with bcrypt-hashed credentials and token validation.
*   **Role-Based Access Control (RBAC)**:
    *   `Super Admin`: Full CRUD privileges, access-role configuration, reporting manager assignment, and record deletion.
    *   `HR Manager`: Create, view, and edit profiles; cannot delete records or assign `Super Admin` privileges.
    *   `Employee`: View all employees and the reporting hierarchy. Can only edit their *own* contact numbers, email, passwords, and profile pictures.
*   **Organizational Hierarchy Tree**:
    *   Visualization of reporting paths in a clean vertical flow.
    *   Auto-population of manager options.
    *   **Circular Reporting Prevention**: Traverses manager chains in real-time during creation/editing to prevent self-reporting or loop-reporting errors.
    *   List direct reportees in profiles.
*   **Analytics Dashboard**: Displays key statistics cards and SVG graphics (broken down by active/inactive ratios, role counts, and department distributions) using Recharts.
*   **Bulk Actions**: Import employees in bulk through raw CSV strings.
*   **UX Features**: Fully integrated light and dark modes with glassmorphic cards and polished transition micro-animations.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React (Vite, TS), Tailwind CSS, Recharts, Lucide Icons |
| **Backend** | Node.js, Express, Prisma ORM, TypeScript |
| **Database** | PostgreSQL |
| **Deployment** | Docker, Docker Compose |

---

## 📦 Getting Started

### Method 1: Local Setup

#### Prerequisites
- Node.js (v18+)
- PostgreSQL running locally on port `5432`

#### 1. Setup Backend
Create a `backend/.env` file with your `DATABASE_URL` (e.g. `DATABASE_URL="postgresql://postgres:password@localhost:5432/ems?schema=public"`), then run:
```bash
cd backend
npm install
# Run Prisma db push to create tables
npx prisma db push
# Seed the database with sample roles (CEO, HR, Engineers, UI Designer)
npm run seed
# Start the Express API server
npm run dev
```

#### 2. Setup Frontend
```bash
cd ../frontend
npm install
# Start Vite development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### Method 2: Docker Compose Setup (One-Click)

Make sure Docker Desktop is active on your machine, then run the following in the root folder:

```bash
docker compose up --build -d
```

This spins up:
- **PostgreSQL Database**: Port `5432`
- **Express Backend**: Port `5000` (auto-migrated and auto-seeded!)
- **React Frontend**: Port `3000` (served via Nginx)

---

## 🔑 SeedTest Credentials

The seeder populates the database with these roles:

| Access Role | Email Address | Password | Description |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@ems.com` | `Admin@123` | Fully featured administrator role |
| **HR Manager** | `hr@ems.com` | `HRManager@123` | HR controller with directory edit privileges |
| **Employee** | `employee@ems.com` | `Employee@123` | Standard staff member (Sarah Connor) |

---

## 📡 REST API Documentation

### Auth Endpoints
*   `POST /api/auth/login`: Authenticate credentials, returns session JWT.
*   `POST /api/auth/logout`: Invalidate user session.
*   `GET /api/auth/me`: Fetch current authenticated profile details.

### Employee Endpoints
*   `GET /api/employees`: Search, filter, sort, and paginate employees.
*   `GET /api/employees/:id`: Retrieve details of a single employee.
*   `POST /api/employees`: Create new employee (Super Admin & HR).
*   `PUT /api/employees/:id`: Update employee details (RBAC checked).
*   `DELETE /api/employees/:id`: Soft delete employee record (Super Admin only).
*   `PATCH /api/employees/:id/manager`: Reassign reporting manager (Super Admin only).
*   `GET /api/employees/:id/reportees`: Retrieve list of direct reportees.
*   `POST /api/employees/import`: Import multiple employee records via CSV string.

### Organization Endpoints
*   `GET /api/organization/tree`: Get full organizational reporting tree.
*   `GET /api/organization/stats`: Get dashboard analytical metrics.
