// import React from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout.jsx";

import Overview from "./pages/Overview.jsx";
import Applicants from "./pages/Applicants.jsx";
import Applications from "./pages/Applications.jsx";
import Documents from "./pages/Documents.jsx";
import Payments from "./pages/Payments.jsx";
import Admissions from "./pages/Admissions.jsx";
import Notifications from "./pages/Notifications.jsx";
import Reports from "./pages/Reports.jsx";
import Settings from "./pages/Settings.jsx";

import Admins from "./pages/administration/Admins.jsx";
import RolesPermissions from "./pages/administration/RolesPermissions.jsx";
import ActivityLogs from "./pages/administration/ActivityLogs.jsx";

import Faculties from "./pages/system/Faculties.jsx";
import Departments from "./pages/system/Departments.jsx";
import Programmes from "./pages/system/Programmes.jsx";
import AcademicSessions from "./pages/system/AcademicSessions.jsx";
import ApplicationSettings from "./pages/system/ApplicationSettings.jsx";
import PaymentSettings from "./pages/system/PaymentSettings.jsx";
import NotificationSettings from "./pages/system/NotificationSettings.jsx";

import AuditLogs from "./pages/security/AuditLogs.jsx";
import LoginSessions from "./pages/security/LoginSessions.jsx";
import SecurityEvents from "./pages/security/SecurityEvents.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Overview />} />
        <Route path="/applicants" element={<Applicants />} />
        <Route path="/applications" element={<Applications />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/admissions" element={<Admissions />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />

        <Route path="/administration/admins" element={<Admins />} />
        <Route path="/administration/roles" element={<RolesPermissions />} />
        <Route path="/administration/activity-logs" element={<ActivityLogs />} />

        <Route path="/system/faculties" element={<Faculties />} />
        <Route path="/system/departments" element={<Departments />} />
        <Route path="/system/programmes" element={<Programmes />} />
        <Route path="/system/academic-sessions" element={<AcademicSessions />} />
        <Route path="/system/application-settings" element={<ApplicationSettings />} />
        <Route path="/system/payment-settings" element={<PaymentSettings />} />
        <Route path="/system/notification-settings" element={<NotificationSettings />} />

        <Route path="/security/audit-logs" element={<AuditLogs />} />
        <Route path="/security/login-sessions" element={<LoginSessions />} />
        <Route path="/security/security-events" element={<SecurityEvents />} />

        <Route path="*" element={<Overview />} />
      </Route>
    </Routes>
  );
}
