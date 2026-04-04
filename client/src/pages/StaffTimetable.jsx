import { useEffect, useState } from "react";
import API from "../lib/api";
import Layout from "../components/Layout";
import { Download } from "lucide-react";

const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT"];
const PERIODS = [
  "9:30-10:20", "10:20-11:10", "11:20-12:10", "12:10-1:00",
  "1:50-2:30", "2:30-3:10", "3:20-4:00", "4:00-4:40",
];

const SERVER = "http://localhost:5000";

export default function StaffTimetable() {
  const [timetable, setTimetable] = useState([]);
  const [department, setDepartment] = useState("");
  const [course, setCourse] = useState("");
  const [year, setYear] = useState("");
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [excelUrl, setExcelUrl] = useState(null);

  useEffect(() => {
    API.get("/staff/departments").then((res) => setDepartments(res.data));
    API.get("/staff/courses").then((res) => setCourses(res.data));
  }, []);

  // Fetch timetable rows + Excel file URL when filters are complete
  useEffect(() => {
    if (department && course && year) {
      API.get("/staff/timetable", { params: { department, course, year } })
        .then((res) => setTimetable(res.data))
        .catch((err) => {
          console.error("Failed to fetch timetable", err);
          setTimetable([]);
        });

      API.get("/staff/timetable-file", { params: { department, course, year } })
        .then((res) => setExcelUrl(res.data.file_path || null))
        .catch(() => setExcelUrl(null));
    } else {
      setTimetable([]);
      setExcelUrl(null);
    }
  }, [department, course, year]);

  return (
    <Layout>
      <div className="bg-white/80 p-6 rounded-xl shadow-md backdrop-blur-sm border border-white/20">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h1 className="text-2xl font-bold">Timetable</h1>
          {excelUrl && (
            <a
              href={`${SERVER}${excelUrl}`}
              download
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              <Download className="w-4 h-4" />
              Download Excel
            </a>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-5">
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Department</option>
            {departments.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>

          <select
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Course</option>
            {courses.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Year</option>
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
          </select>
        </div>

        {/* Timetable table */}
        {timetable.length > 0 ? (
          <div className="overflow-auto rounded-xl border border-gray-200">
            <table className="w-full text-center text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="p-3 font-semibold text-gray-600">Day</th>
                  {PERIODS.map((p, i) => (
                    <th key={i} className="p-3 font-semibold text-gray-600 whitespace-nowrap">{p}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DAYS.map((day) => (
                  <tr key={day} className="border-t">
                    <td className="font-bold p-3 bg-slate-50">{day}</td>
                    {PERIODS.map((_, i) => {
                      const subject = timetable.find(
                        (t) => t.day === day && t.period === i + 1
                      )?.subject || "-";
                      return (
                        <td key={i} className="border-l p-2 text-gray-700">{subject}</td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-400 text-sm text-center py-12 border-2 border-dashed rounded-xl">
            Select department, course and year to view the timetable.
          </p>
        )}
      </div>
    </Layout>
  );
}