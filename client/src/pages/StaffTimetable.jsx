import { useEffect, useState } from "react";
import API from "../lib/api";
import Layout from "../components/Layout";

const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT"];
const PERIODS = [
  "9:30-10:20", "10:20-11:10", "11:20-12:10", "12:10-1:00",
  "1:50-2:30", "2:30-3:10", "3:20-4:00", "4:00-4:40"
];

export default function StaffTimetable() {
  const [timetable, setTimetable] = useState([]);
  const [department, setDepartment] = useState("");
  const [course, setCourse] = useState("");
  const [year, setYear] = useState("1"); // Default to 1st year, staff can change this.
  
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);

  // Fetch departments and courses for filters
  useEffect(() => {
    API.get("/staff/departments").then((res) => setDepartments(res.data));
    API.get("/staff/courses").then((res) => setCourses(res.data));
  }, []);


  // Fetch timetable when filters change
  useEffect(() => {
    if (department && course && year) {
      API.get("/admin/timetable", {
        params: { department, course, year }
      })
      .then(res => {
        setTimetable(res.data);
      })
      .catch(err => {
        console.error("Failed to fetch timetable", err);
        setTimetable([]);
      });
    } else {
      setTimetable([]);
    }
  }, [department, course, year]);

  return (
    <Layout>
      <div className="bg-white/80 p-6 rounded-lg shadow-md backdrop-blur-sm border border-white/20">
        <h1 className="text-2xl font-bold mb-4">My Timetable</h1>
        
        <div className="flex gap-4 mb-4 items-center">
            <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="border p-2 rounded-md"
            >
                <option value="">Select Department</option>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="border p-2 rounded-md"
            >
                <option value="">Select Course</option>
                {courses.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <div>
                <label htmlFor="year-select" className="mr-2 font-semibold">Select Year:</label>
                <select 
                    id="year-select"
                    value={year} 
                    onChange={e => setYear(e.target.value)}
                    className="border p-2 rounded-md"
                >
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                </select>
            </div>
        </div>

        {timetable.length > 0 ? (
        <div className="overflow-auto">
          <table className="w-full border text-center">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-2">Day</th>
                {PERIODS.map((p, i) => (
                  <th key={i} className="p-2">{p}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DAYS.map(day => (
                <tr key={day}>
                  <td className="font-bold p-2">{day}</td>
                  {PERIODS.map((_, i) => {
                    const periodNumber = i + 1;
                    const subject = timetable.find(
                      t => t.day === day && t.period === periodNumber
                    )?.subject || "-";
                    return (
                      <td key={i} className="border p-2">
                        {subject}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        ) : (
          <p className="text-gray-500 text-center py-10 border-2 border-dashed rounded-lg">Please select filters to view the timetable.</p>
        )}
      </div>
    </Layout>
  );
}