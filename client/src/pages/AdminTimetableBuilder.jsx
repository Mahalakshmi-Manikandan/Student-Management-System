import { useState, useEffect } from "react";
import API from "../lib/api";
import Navbar from "../components/Navbar";
import * as XLSX from "xlsx";

export default function AdminTimetableBuilder() {

  const days = ["MON","TUE","WED","THU","FRI","SAT"];
  const periods = [1,2,3,4,5,6,7,8];

  const [file, setFile] = useState(null);

  const [department, setDepartment] = useState("");
  const [course, setCourse] = useState("");
  const [year, setYear] = useState("");

  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);

  // Fetch existing departments and courses from the user table
  useEffect(() => {
    API.get("/admin/departments").then((res) => setDepartments(res.data));
    API.get("/admin/courses").then((res) => setCourses(res.data));
  }, []);

  const [table, setTable] = useState({});

  // Handle input change
  const handleChange = (day, period, value) => {
    setTable(prev => ({
      ...prev,
      [`${day}-${period}`]: value
    }));
  };
  // ===== Upload Excel =====
    const handleUpload = async () => {
      if (!file) return alert("Select file");
  
      const formData = new FormData();
      formData.append("file", file);
      formData.append("department", department);
      formData.append("course", course);
      formData.append("year", year);
  
      try {
        await API.post("/admin/upload-timetable", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
  
        alert("Uploaded Successfully");
      } catch (err) {
        alert("Upload failed");
      }
    };

  const handleDownloadTemplate = () => {
    const data = [
      { Day: "MON", P1: "Math", P2: "Physics", P3: "Chem", P4: "Break", P5: "Lab", P6: "Eng", P7: "Sports", P8: "Lib" },
      { Day: "TUE", P1: "", P2: "", P3: "", P4: "", P5: "", P6: "", P7: "", P8: "" }
    ];
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Timetable");
    XLSX.writeFile(wb, "Timetable_Template.xlsx");
  };

  // Save timetable
  const handleSave = async () => {

    if (!department || !course || !year) {
      return alert("Enter department, course & year");
    }

    if (Object.keys(table).length === 0) {
      return alert("Timetable is empty. Please enter subjects.");
    }

    const formattedData = [];

    Object.keys(table).forEach(key => {
      const [day, period] = key.split("-");

      formattedData.push({
        day,
        period: Number(period),
        subject: table[key]
      });
    });

    try {
      await API.post("/admin/save-timetable", {
        department,
        course,
        year,
        timetable: formattedData
      });

      alert("Timetable Saved Successfully");
    } catch (err) {
      alert("Error saving timetable");
    }
  };

  return (
    <div
      className="min-h-screen bg-white bg-contain bg-no-repeat bg-center bg-fixed"
      style={{ backgroundImage: "url('/college.png')" }}
    >
      <Navbar />
      <div className="p-6">
      {/* ===== Upload Section ===== */}
      <div className="bg-white/80 p-6 shadow-md rounded-lg mb-8 border backdrop-blur-sm border-white/20">

        <h2 className="text-xl font-semibold mb-4">
          Upload Timetable
        </h2>

        <div className="flex gap-4 flex-wrap">

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

          <input
            type="text"
            placeholder="Year"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="border p-2 rounded-md w-32"
          />

          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={(e) => setFile(e.target.files[0])}
            className="border p-2 rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />

          <button
            onClick={handleUpload}
            className="bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded-md"
          >
            Upload
          </button>
          <button
            onClick={handleDownloadTemplate}
            className="bg-slate-500 hover:bg-slate-600 text-white px-4 py-2 rounded-md"
          >
            Download Template
          </button>
        </div>

      </div>
      {/* ===== Timetable Section ===== */}

      <div className="bg-white/80 p-6 shadow-md rounded-lg border backdrop-blur-sm border-white/20">
        <h2 className="text-xl font-bold mb-4">
        Create Timetable
      </h2>

      {/* Inputs */}
      <div className="flex gap-4 mb-4">
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

          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="border p-2 rounded-md"
          >
            <option value="">Select Year</option>
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
          </select>
      </div>

      {/* Table */}
      <div className="overflow-auto">
        <table className="border w-full text-center">

          <thead className="bg-slate-100">
            <tr>
              <th>Day</th>
              {periods.map(p => (
                <th key={p}>P{p}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {days.map(day => (
              <tr key={day}>
                <td className="font-bold">{day}</td>

                {periods.map(period => (
                  <td key={period} className="border">
                    <input
                      type="text"
                      placeholder="Subject"
                      value={table[`${day}-${period}`] || ""}
                      onChange={(e)=>
                        handleChange(day, period, e.target.value)
                      }
                      className="w-full p-1 text-center border-0 focus:ring-1 focus:ring-blue-500"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>

        </table>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className="mt-4 bg-slate-700 hover:bg-slate-800 text-white px-6 py-2 rounded-md"
      >
        Save Timetable
      </button>
      </div>
    </div>
    </div>
  );
}