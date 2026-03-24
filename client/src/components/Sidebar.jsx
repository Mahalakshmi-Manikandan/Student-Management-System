import { Link } from "react-router-dom";

export default function Sidebar() {

  const role = localStorage.getItem("role");

  return (
    <div className="w-64 bg-gray-100 min-h-screen p-5">

      <div className="flex flex-col gap-3">

        {role === "admin" && (
          <div className="flex flex-col gap-4">
            <Link to="/admin/dashboard">Dashboard</Link>
            <Link to="/admin/students">Student List</Link>
            <Link to="/admin/staff">Staff List</Link>
            <Link to="/admin/timetable">Timetable</Link>  
          </div>
        )}

        {role === "staff" && (
          <>
            <Link to="/staff">Dashboard</Link>
            <Link to="#">Attendance</Link>
            <Link to="#">Assignments</Link>
            <Link to="#">Timetable</Link>
          </>
        )}

        {role === "student" && (
          <>
            <Link to="/student">Dashboard</Link>
            <Link to="#">Assignments</Link>
            <Link to="#">Attendance</Link>
            <Link to="#">Study Planner</Link>
          </>
        )}

      </div>
    </div>
  );
}