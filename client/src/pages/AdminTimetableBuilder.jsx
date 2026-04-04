import { useState, useEffect } from "react";
import API from "../lib/api";
import Navbar from "../components/Navbar";
import * as XLSX from "xlsx";

export default function AdminTimetableBuilder() {
  const [file, setFile] = useState(null);
  const [department, setDepartment] = useState("");
  const [course, setCourse] = useState("");
  const [year, setYear] = useState("");
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null); // { type: "success"|"error", text }

  useEffect(() => {
    API.get("/admin/departments").then((res) => setDepartments(res.data));
    API.get("/admin/courses").then((res) => setCourses(res.data));
  }, []);

  const handleUpload = async () => {
    if (!file) return setMessage({ type: "error", text: "Please select an Excel file." });
    if (!department || !course || !year)
      return setMessage({ type: "error", text: "Please select department, course, and year." });

    const formData = new FormData();
    formData.append("department", department);
    formData.append("course", course);
    formData.append("year", year);
    formData.append("file", file);

    try {
      setUploading(true);
      await API.post("/admin/upload-timetable", formData);
      setMessage({ type: "success", text: "Timetable uploaded successfully!" });
      setFile(null);
      // Reset the file input
      document.getElementById("timetable-file-input").value = "";
    } catch (err) {
      if (err.response?.status === 401) {
        setMessage({ type: "error", text: "Session expired. Please log in again." });
      } else {
        setMessage({ type: "error", text: err.response?.data?.message || "Upload failed." });
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadTemplate = () => {
    const data = [
      { Day: "MON", P1: "Math", P2: "Physics", P3: "Chemistry", P4: "Break", P5: "Lab", P6: "English", P7: "Sports", P8: "Library" },
      { Day: "TUE", P1: "", P2: "", P3: "", P4: "", P5: "", P6: "", P7: "", P8: "" },
      { Day: "WED", P1: "", P2: "", P3: "", P4: "", P5: "", P6: "", P7: "", P8: "" },
      { Day: "THU", P1: "", P2: "", P3: "", P4: "", P5: "", P6: "", P7: "", P8: "" },
      { Day: "FRI", P1: "", P2: "", P3: "", P4: "", P5: "", P6: "", P7: "", P8: "" },
      { Day: "SAT", P1: "", P2: "", P3: "", P4: "", P5: "", P6: "", P7: "", P8: "" },
    ];
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Timetable");
    XLSX.writeFile(wb, "Timetable_Template.xlsx");
  };

  return (
    <div
      className="min-h-screen bg-white bg-contain bg-no-repeat bg-center bg-fixed"
      style={{ backgroundImage: "url('/college.png')" }}
    >
      <Navbar />
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Timetable Management</h1>

        <div className="bg-white/90 p-6 shadow-md rounded-xl border border-white/30 backdrop-blur-sm">
          <h2 className="text-xl font-semibold mb-2">Upload Timetable via Excel</h2>
          <p className="text-sm text-gray-500 mb-5">
            Upload an Excel file in the required format. The existing timetable for the
            selected filter will be replaced automatically.
          </p>

          {/* Status message */}
          {message && (
            <div
              className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${
                message.type === "success"
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
              <select
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Course</option>
                {courses.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Year</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </div>
          </div>

          {/* File input */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-1">Excel File (.xlsx / .xls)</label>
            <input
              id="timetable-file-input"
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => { setFile(e.target.files[0]); setMessage(null); }}
              className="w-full border border-dashed border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-600
                         file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0
                         file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700
                         hover:file:bg-blue-100 cursor-pointer"
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              {uploading ? "Uploading..." : "Upload Timetable"}
            </button>
            <button
              onClick={handleDownloadTemplate}
              className="bg-slate-600 hover:bg-slate-700 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              Download Template
            </button>
          </div>
        </div>

        {/* Instructions card */}
        <div className="mt-6 bg-blue-50/80 border border-blue-200 rounded-xl p-5 backdrop-blur-sm">
          <h3 className="font-semibold text-blue-900 mb-2">Excel File Format</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Column <strong>Day</strong>: MON, TUE, WED, THU, FRI, SAT</li>
            <li>Columns <strong>P1 – P8</strong>: Subject names for each period</li>
            <li>Leave a cell blank if there is no class for that period</li>
            <li>Download the template above to get the exact format</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
