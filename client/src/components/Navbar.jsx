import { Bell } from "lucide-react";
import { Link } from "react-router-dom";

export default function Navbar() {

  const role = localStorage.getItem("role");

  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <div className="w-full bg-white shadow p-4 flex justify-between items-center">

      {/* Left: Logo + Title */}
      <div className="flex items-center gap-3">
        <img src="/college.png" className="w-10" />
        <h2 className="font-bold text-lg">Takshashila University</h2>
      </div>

      {/* Center: Role-based Menu (from Sidebar) */}
      <div className="flex gap-6 items-center">

        {role === "admin" && (
          <>
          <Link to="/admin">Dashboard</Link>
            <Link to="/admin/dashboard">Admin</Link>
            <Link to="/admin/students">Student</Link>
            <Link to="/admin/staff">Staff</Link>
            <Link to="/admin/timetable">Timetable</Link>
          </>
        )}

        {role === "staff" && (
          <>
            <Link to="/staff">Dashboard</Link>
            <Link to="/staff/attendance">Attendance</Link>
            {/* <Link to="/staff/assignment">Assignments</Link> */}
            <Link to="/staff/timetable">Timetable</Link>
          </>
        )}

        {role === "student" && (
          <>
            <Link to="/student">Dashboard</Link>
          </>
        )}

      </div>

      {/* Right: Bell + Logout */}
      <div className="flex gap-4 items-center">
        <Bell />

        <button
          className="bg-red-500 text-white px-4 py-1 rounded"
          onClick={logout}
        >
          Logout
        </button>
      </div>

    </div>
  );
}