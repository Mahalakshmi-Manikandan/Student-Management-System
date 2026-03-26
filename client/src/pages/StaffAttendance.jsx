import { useEffect, useState } from "react";
import API from "../lib/api";
import Layout from "../components/Layout";

const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

export default function StaffAttendance() {
  const [departments, setDepartments] = useState([]);
  const [students, setStudents] = useState([]);
  const [department, setDepartment] = useState("");
  const [course, setCourse] = useState("");
  const [attendanceDate, setAttendanceDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [attendance, setAttendance] = useState({}); // { "studentId-period": "present" | "absent" }

  useEffect(() => {
    // Fetch all unique departments to populate the dropdown
    API.get("/staff/departments")
      .then((res) => {
        setDepartments(res.data);
      })
      .catch((err) => {
        console.error("Failed to fetch departments", err);
        alert("Could not load departments.");
      });
  }, []);

  const handleFetchStudents = () => {
    if (department) {
      API.get("/staff/students", { params: { department, course } })
        .then((res) => {
          setStudents(res.data);
          setAttendance({}); // Reset attendance when students change
        })
        .catch((err) => {
          console.error("Failed to fetch students", err);
          alert("Could not fetch students.");
        });
    } else {
      alert("Please select a department first.");
    }
  };

  const handleAttendanceChange = (studentId, period, status) => {
    setAttendance((prev) => ({
      ...prev,
      [`${studentId}-${period}`]: status,
    }));
  };

  const handleSave = async () => {
    if (Object.keys(attendance).length === 0) {
      return alert("No attendance data to save.");
    }

    const payload = {
      attendance_date: attendanceDate,
      records: Object.entries(attendance).map(([key, status]) => {
        const [studentId, period] = key.split("-");
        return { student_id: parseInt(studentId), period: parseInt(period), status };
      }),
    };

    try {
      await API.post("/staff/attendance", payload);
      alert(`Attendance saved successfully!`);
    } catch (error) {
      console.error(`Failed to save attendance`, error);
      alert(`Failed to save attendance.`);
    }
  };

  return (
    <Layout>
      <div className="bg-white/80 p-6 rounded-lg shadow-md backdrop-blur-sm border border-white/20">
        <h1 className="text-2xl font-bold mb-6">Mark Attendance</h1>

        <div className="flex gap-4 mb-4 items-center">
          <input
            type="date"
            value={attendanceDate}
            onChange={(e) => setAttendanceDate(e.target.value)}
            className="border p-2 rounded-md"
          />
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="border p-2 w-full rounded-md"
          >
            <option value="">Select Department</option>
            {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
          </select>
          <input
            placeholder="Filter by Course"
            className="border p-2 w-full rounded-md"
            value={course}
            onChange={(e) => setCourse(e.target.value)}
          />
          <button onClick={handleFetchStudents} className="bg-blue-600 text-white px-4 py-2 rounded-md whitespace-nowrap">
            Fetch Students
          </button>
        </div>

        {students.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border text-center">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="p-2 align-bottom">Student Name</th>
                    {PERIODS.map((p) => (<th key={p}>P{p}</th>))}
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id} className="border">
                      <td className="p-2 text-left">{student.name}</td>
                      {PERIODS.map((period) => (
                        <td key={period} className="border p-1">
                          <select
                            value={attendance[`${student.id}-${period}`] || ""}
                            onChange={(e) => handleAttendanceChange(student.id, period, e.target.value)}
                            className="border p-1 rounded-md w-full"
                          >
                            <option value="" disabled>Mark</option>
                            <option value="present">Present</option>
                            <option value="absent">Absent</option>
                          </select>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="text-right mt-4">
              <button onClick={handleSave} className="bg-green-600 text-white px-6 py-2 rounded-md">
                Save Attendance
              </button>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}