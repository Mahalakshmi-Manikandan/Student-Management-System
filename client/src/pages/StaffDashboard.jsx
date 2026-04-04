import { useEffect, useState } from "react";
import API from "../lib/api";
import Layout from "../components/Layout";
import { Search, BookOpen, Calendar, User } from "lucide-react";

export default function StaffDashboard() {
  const [staffDetails, setStaffDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  // Assignment filter state
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [filterDept, setFilterDept] = useState("");
  const [filterCourse, setFilterCourse] = useState("");
  const [filterYear, setFilterYear] = useState("");

  const [assignments, setAssignments] = useState([]);
  const [assignLoading, setAssignLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    API.get("/auth/me")
      .then((res) => setStaffDetails(res.data))
      .catch((err) => console.error("Failed to fetch staff details", err))
      .finally(() => setLoading(false));

    API.get("/staff/departments").then((res) => setDepartments(res.data));
    API.get("/staff/courses").then((res) => setCourses(res.data));
  }, []);

  const handleSearch = () => {
    setAssignLoading(true);
    setSearched(true);
    const params = {};
    if (filterDept) params.department = filterDept;
    if (filterCourse) params.course = filterCourse;
    if (filterYear) params.year = filterYear;

    API.get("/staff/assignments", { params })
      .then((res) => setAssignments(res.data))
      .catch((err) => {
        console.error("Failed to fetch assignments", err);
        setAssignments([]);
      })
      .finally(() => setAssignLoading(false));
  };

  // const formatDate = (dateStr) => {
  //   if (!dateStr) return "-";
  //   return new Date(dateStr).toLocaleDateString("en-IN", {
  //     day: "2-digit", month: "short", year: "numeric",
  //   });
  // };

  // const yearLabel = (y) =>
  //   ({ 1: "1st Year", 2: "2nd Year", 3: "3rd Year", 4: "4th Year" }[y] || y);

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Staff Dashboard</h1>

      {/* ── Staff Details Card ── */}
      <div className="bg-white/80 p-6 rounded-xl shadow backdrop-blur-sm border border-white/20 mb-6">
        {loading ? (
          <p className="text-gray-500">Loading your details...</p>
        ) : staffDetails ? (
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <User className="w-7 h-7 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{staffDetails.name}</h2>
              <p className="text-sm text-gray-500">{staffDetails.designation}</p>
              <div className="mt-3 flex flex-wrap gap-x-8 gap-y-1 text-sm">
                <span><span className="text-gray-500">Email:</span> {staffDetails.email}</span>
                <span><span className="text-gray-500">Department:</span> {staffDetails.department}</span>
                <span><span className="text-gray-500">Role:</span> {staffDetails.role}</span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-red-500">Could not load staff details.</p>
        )}
      </div>

      {/* ── Assignments Section ── */}
      {/* <div className="bg-white/80 p-6 rounded-xl shadow backdrop-blur-sm border border-white/20"> */}
        {/* <div className="flex items-center gap-2 mb-5">
          <BookOpen className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold">Assigned Assignments</h2>
        </div> */}

        {/* Filters */}
        {/* <div className="flex flex-wrap gap-3 mb-5">
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <select
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Courses</option>
            {courses.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Years</option>
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
          </select>

          <button
            onClick={handleSearch}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            <Search className="w-4 h-4" />
            Search
          </button>
        </div> */}

        {/* Results */}
        {/* {assignLoading ? (
          <p className="text-gray-400 text-sm py-6 text-center">Loading assignments...</p>
        ) : searched && assignments.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl">
            <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">No assignments found for the selected filters.</p>
          </div>
        ) : assignments.length > 0 ? (
          <div className="overflow-auto rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left">
                  <th className="px-4 py-3 font-semibold text-gray-600">#</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Title</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Subject</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Department</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Course</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Year</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Due Date</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((a, idx) => (
                  <tr key={a.id} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/60"}>
                    <td className="px-4 py-3 text-gray-400">{idx + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{a.title}</td>
                    <td className="px-4 py-3 text-gray-600">{a.subject}</td>
                    <td className="px-4 py-3 text-gray-600">{a.department}</td>
                    <td className="px-4 py-3 text-gray-600">{a.course || "-"}</td>
                    <td className="px-4 py-3 text-gray-600">{yearLabel(a.year)}</td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(a.due_date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : !searched ? (
          <p className="text-gray-400 text-sm text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
            Use the filters above and click <strong>Search</strong> to view assignments.
          </p>
        ) : null}
       </div> */}
    </Layout>
  );
}
