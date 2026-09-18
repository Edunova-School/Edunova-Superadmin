# EduNova — Superadmin Dashboard

A multi-page Vite + React dashboard for the Superadmin role on the EduNova
admissions platform. It extends the Applicant Portal's visual identity
(navy, gold, off-white, serif + sans type) into a system-level control
surface: admin management, RBAC, academic structure, platform
configuration, and security.

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL (typically `http://localhost:5173`).

To build for production:

```bash
npm run build
npm run preview
```

## Structure

```
src/
  components/       Shared UI: Sidebar, Topbar, Layout, DataTable, ui primitives
  data/mockData.js  All mock data — swap this out for real API calls
  pages/            One file per route, grouped to match the sidebar
    administration/ Admins, Roles & Permissions, Activity Logs
    system/         Faculties, Departments, Programmes, Academic Sessions,
                     Application/Payment/Notification Settings
    security/       Audit Logs, Login Sessions, Security Events
```

## Notes on the design

- **Admin Management** — create, suspend, activate, reset access, and
  revoke sessions for any admin, all with confirmation dialogs.
- **Roles & Permissions** — a real RBAC model: a role hierarchy visual and
  a per-module, per-action permission matrix (`src/data/mockData.js` →
  `permissionModules`), not a hardcoded `admin` / `superadmin` flag.
- **Academic Sessions** — sessions carry a lifecycle (Draft → Active →
  Closed) with their own dates, fee, and application status.
- **Faculty → Department → Programme** — a strict three-level hierarchy;
  ordinary admissions staff never touch this data.
- **Audit Logs** are presented as append-only: there is no delete action
  anywhere in that UI, by design.

Everything currently reads from and writes to in-memory mock data
(`src/data/mockData.js` and local component state) — wire up your API
client where each page calls `useState`/imports mock arrays.
