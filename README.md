# AMS — Academy Management System

> **Simplifying Academy Management.**  
> A full-stack, beginner-friendly web application designed for academies, coaching centers, and training institutes to manage admissions, courses, batches, enrollments, fees, and reports digitally.

---

##  Project Overview

**AMS (Academy Management System)** replaces paper forms, spreadsheets, and manual ledgers with a centralized, professional web platform. Built with **React** and **Node.js/Express** using **MongoDB Atlas**, it is structured to be easy to understand for beginners, modular, and styled using dedicated **external CSS** files rather than complex Tailwind frameworks.

---

##  Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React, Vite, React Router, Axios, Lucide React, Recharts |
| **Styling** | External CSS (`.css` per page/component) — clean, beginner-friendly |
| **Backend** | Node.js, Express.js (ES modules), REST APIs |
| **Database** | MongoDB Atlas with Mongoose models, indexes, and aggregations |
| **Authentication** | JWT (JSON Web Tokens), bcrypt password hashing, Role-Based Access Control |
| **Testing** | Node.js test runner for business rules and security |

---

## ✨ Features Implemented

### 1.  Real-Time Dashboard
- **Key Metrics Cards:** Total Students, Active Students, Courses, Active Batches, Active Enrollments, Total Fees Collected (₹), and Outstanding Balances (₹).
- **Interactive Visualizations (Recharts):**
  - Course Enrollment Distribution (Bar Chart).
  - Monthly Fee Collection Trends (Bar Chart).
- **Live Activity Feeds:** Recent student registrations, recent enrollments, and recent fee payments.

### 2.  Student Management
- **Safe ID Generation:** Auto-generates unique, readable student IDs (e.g., `STU-2026-0001`).
- **Student Directory Table:** Real-time search by name, phone, email, or ID; status filters (Active, Inactive, Archived).
- **Student Registration & Editing:** Name, Phone, Email, Date of Birth, Gender, Address, City, Emergency Contact, and Notes.
- **Dedicated Student Profile (`/student/:id`):** Displays personal details, all active/completed course enrollments, batch assignments, and fee payment history.

### 3.  Course Management
- **Course Catalog:** Unique course codes (e.g., `FS-MERN-01`), durations (Weeks/Months/Hours), fees, categories, and enrollment counts.
- **Course Actions:** Add course modal, edit course details, and one-click Archive/Activate toggle to protect historical records.

### 4.  Batch Management
- **Batch Scheduling:** Organizes courses into morning, evening, or weekend batches with start/end dates and times.
- **Capacity Enforcement:** Visual capacity meter bar (e.g., `15 / 30 (50%)`) and backend validation preventing overbooking when maximum capacity is reached.

### 5.  Enrollment Management
- **Enrollment Workflow:** Select student and course; auto-fills course fee; allows applying authorized discounts; auto-calculates final payable amount (`Agreed Fee - Discount = Final Payable`).
- **Integrity Protections:** Prevents duplicate active enrollments for the same student and course.
- **Status Lifecycles:** Supports `Pending`, `Active`, `Completed`, and `Cancelled` statuses.

### 6.  Payment & Fee Management
- **Financial Tracking:** Tracks agreed fees, partial payments, multiple installments, and remaining balances.
- **Overpayment Guard:** Automatically rejects payments exceeding the outstanding balance.
- **Official Receipts:** Generates unique receipt numbers (e.g., `RCP-2026-0001`) with printable acknowledgement modals.
- **Payment Methods:** Cash, UPI, Bank Transfer, Card, Other.

### 7.  Reports & Analytics (with CSV Export)
- 4 Dedicated Interactive Reports:
  1. **Student Directory Report**
  2. **Course Enrollments Report**
  3. **Fee Collections Report**
  4. **Outstanding Balances Report**
- **One-Click CSV Download:** Exports tabular reports into `.csv` files for spreadsheets and offline auditing.

### 8. Staff Management & Access Control
- **Role-Based Permissions:** Distinguishes between `Admin` and `Staff`.
- **Admin Control Area:** Create staff accounts, assign roles, activate/deactivate accounts, and reset staff passwords.

### 9.  Academy Settings
- Configures Academy Name, Tagline, Contact Email, Contact Phone, Campus Address, Default Currency (default: **INR ₹**), and Timezone.

---

##  Project Structure

```
Student-Management/
├── package.json              # Root scripts to run both apps easily
├── README.md                 # Complete system documentation
│
├── backend/                  # Node.js + Express + MongoDB Atlas
│   ├── config/
│   │   └── db.js             # MongoDB Atlas connection & error helper
│   ├── middleware/
│   │   └── auth.js           # JWT verification & Admin authorization
│   ├── models/
│   │   ├── user.js           # Admin & Staff user model
│   │   ├── student.js        # Student model with auto STU ID
│   │   ├── course.js         # Course model with unique code & fees
│   │   ├── batch.js          # Batch model with capacity limits
│   │   ├── enrollment.js     # Enrollment model linking student + course
│   │   ├── payment.js        # Payment transactions & receipt numbers
│   │   └── settings.js       # Academy profile & currency settings
│   ├── routes/
│   │   ├── authRoutes.js     # /login, /register, /me
│   │   ├── studentRoutes.js  # CRUD, search, filter, student profile
│   │   ├── courseRoutes.js   # CRUD, course counts, archive toggle
│   │   ├── batchRoutes.js    # CRUD, capacity tracking
│   │   ├── enrollmentRoutes.js # Enrollment rules & fee validation
│   │   ├── paymentRoutes.js  # Payment tracking & overpayment checks
│   │   ├── dashboardRoutes.js# Real aggregation metrics & chart data
│   │   ├── reportRoutes.js   # Tabular reports & CSV exports
│   │   ├── staffRoutes.js    # Admin-only staff account management
│   │   └── settingsRoutes.js # Academy profile configuration
│   ├── seed.js               # Development demo seed script
│   ├── test-rules.js         # Core business logic automated tests
│   ├── server.js             # Main Express server entry point
│   ├── .env                  # Backend environment variables
│   └── package.json
│
└── student-management/       # React (Vite) Frontend
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx & Navbar.css
    │   │   ├── Sidebar.jsx & Sidebar.css
    │   │   ├── StudentTable.jsx & StudentTable.css
    │   │   └── ProtectedRoute.jsx
    │   ├── pages/
    │   │   ├── Dashboard.jsx & Dashboard.css
    │   │   ├── Students.jsx & Students.css
    │   │   ├── AddStudent.jsx & AddStudent.css
    │   │   ├── EditStudent.jsx
    │   │   ├── ViewStudent.jsx & ViewStudent.css
    │   │   ├── Courses.jsx & Courses.css
    │   │   ├── Batches.jsx & Batches.css
    │   │   ├── Enrollments.jsx & Enrollments.css
    │   │   ├── Payments.jsx & Payments.css
    │   │   ├── Reports.jsx & Reports.css
    │   │   ├── Staff.jsx & Staff.css
    │   │   ├── Settings.jsx & Settings.css
    │   │   └── LoginForm.jsx & LoginForm.css
    │   ├── services/         # Reusable Axios service modules
    │   │   ├── api.js
    │   │   ├── studentService.js
    │   │   ├── courseService.js
    │   │   ├── batchService.js
    │   │   ├── enrollmentService.js
    │   │   ├── paymentService.js
    │   │   ├── reportService.js
    │   │   ├── staffService.js
    │   │   └── settingsService.js
    │   ├── app.jsx           # App routing with React Router
    │   └── main.jsx
    └── package.json
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **MongoDB Atlas** Account & Cluster



> **Important MongoDB Atlas IP Whitelist Step:**  
> If you see `Could not connect to any servers in your MongoDB Atlas cluster`, log in to your **MongoDB Atlas Console** → **Network Access** → click **Add IP Address** → select **"Allow Access from Anywhere" (`0.0.0.0/0`)** or add your current IP address.

### 3. Seed Demo Data (Optional)
To populate realistic courses, batches, students, enrollments, payments, and admin accounts into your MongoDB Atlas database:
```bash
npm run seed
```


## 🏃 Running the Application

### Start the Backend Server:
```bash
npm run server
```
*The backend API will run on `http://localhost:5000`.*

### Start the Frontend Client:
```bash
npm run dev
```
*The Vite frontend will open at `http://localhost:5173`.*

### Run Automated Tests:
```bash
npm run test
```

### Build Frontend for Production:
```bash
npm run client:build
```

---

