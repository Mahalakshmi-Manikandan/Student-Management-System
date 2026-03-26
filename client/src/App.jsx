import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";

import AdminDashboard from "./pages/AdminDashboard";
import AdminStudents from "./pages/AdminStudents";
import AdminStaff from "./pages/AdminStaff";
import AdminCRUD from "./pages/AdminCRUD";
import AdminTimetableBuilder from "./pages/AdminTimetableBuilder";

import StaffDashboard from "./pages/StaffDashboard";
import StudentDashboard from "./pages/StudentDashboard";

import StaffAttendance from "./pages/StaffAttendance";
import StaffAssignment from "./pages/StaffAssignment";
import StaffTimetable from "./pages/StaffTimetable";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLIC */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ADMIN */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute role="admin">
              <AdminCRUD />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/students"
          element={
            <ProtectedRoute role="admin">
              <AdminStudents />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/staff"
          element={
            <ProtectedRoute role="admin">
              <AdminStaff />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/timetable"
          element={
            <ProtectedRoute role="admin">
              <AdminTimetableBuilder />
            </ProtectedRoute>
          }
        />

        {/* STAFF */}
        <Route
          path="/staff"
          element={
            <ProtectedRoute role="staff">
              <StaffDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/staff/attendance"
          element={
            <ProtectedRoute role="staff">
              <StaffAttendance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/assignment"
          element={
            <ProtectedRoute role="staff">
              <StaffAssignment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/timetable"
          element={
            <ProtectedRoute role="staff">
              <StaffTimetable />
            </ProtectedRoute>
          }
        />
        {/* STUDENT */}
        <Route
          path="/student"
          element={
            <ProtectedRoute role="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<h1>404 Page Not Found</h1>} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;