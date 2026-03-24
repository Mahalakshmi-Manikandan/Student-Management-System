import { useEffect, useState } from "react";
import API from "../lib/api";
import Layout from "../components/Layout";

export default function AdminDashboard() {

  const [metrics, setMetrics] = useState({
    students: 0,
    staff: 0,
    admins: 0
  });

  const [department, setDepartment] = useState("");
  const [year, setYear] = useState("");
  const [file, setFile] = useState(null);
  const [timetable, setTimetable] = useState([]);

  const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT"];

  const periods = [
    "9:30-10:20",
    "10:20-11:10",
    "11:20-12:10",
    "12:10-1:00",
    "1:50-2:30",
    "2:30-3:10",
    "3:20-4:00",
    "4:00-4:40"
  ];

  // ===== Current Day & Period =====
  const currentDay = new Date().toLocaleString("en-US", {
    weekday: "short"
  }).toUpperCase();

  const getCurrentPeriod = () => {
    const hour = new Date().getHours();
    const minute = new Date().getMinutes();
    const time = hour + minute / 60;

    if (time >= 9.5 && time < 10.33) return 0;
    if (time < 11.16) return 1;
    if (time < 12.16) return 2;
    if (time < 13) return 3;
    if (time < 14.5) return 4;
    if (time < 15.16) return 5;
    if (time < 16) return 6;
    return 7;
  };

  const currentPeriod = getCurrentPeriod();

  // ===== Fetch Data =====
  useEffect(() => {
    API.get("/admin/dashboard").then(res => {
      setMetrics({
        students: res.data.students,
        staff: res.data.staff,
        admins: res.data.admins
      });

      setTimetable(res.data.timetable || []);
    });
  }, []);

  // ===== Upload Excel =====
  const handleUpload = async () => {
    if (!file) return alert("Select file");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("department", department);
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

  return (
    <Layout>

      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {/* ===== Metrics Cards ===== */}
      <div className="grid grid-cols-3 gap-4 mb-8">

        <div className="bg-blue-500 text-white p-4 rounded">
          <h2>Total Students</h2>
          <p className="text-2xl">{metrics.students}</p>
        </div>

        <div className="bg-green-500 text-white p-4 rounded">
          <h2>Total Staff</h2>
          <p className="text-2xl">{metrics.staff}</p>
        </div>

        <div className="bg-purple-500 text-white p-4 rounded">
          <h2>Total Admins</h2>
          <p className="text-2xl">{metrics.admins}</p>
        </div>

      </div>

      {/* ===== Upload Section ===== */}
      <div className="bg-white p-4 shadow rounded mb-8">

        <h2 className="text-xl font-semibold mb-4">
          Upload Timetable (Excel)
        </h2>

        <div className="flex gap-4 flex-wrap">

          <input
            type="text"
            placeholder="Department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="border p-2"
          />

          <input
            type="text"
            placeholder="Year"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="border p-2"
          />

          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={(e) => setFile(e.target.files[0])}
            className="border p-2"
          />

          <button
            onClick={handleUpload}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Upload
          </button>

        </div>

      </div>

      {/* ===== Timetable ===== */}
      <div className="bg-white p-4 shadow rounded">

        <h2 className="text-xl font-semibold mb-4">
          Weekly Timetable
        </h2>

        <div className="overflow-auto">

          <table className="w-full border text-center">

            <thead>
              <tr className="bg-gray-200">
                <th>Day</th>
                {periods.map((p, i) => (
                  <th key={i}>{p}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              {days.map((day) => (
                <tr key={day}>
                  <td className="font-bold">{day}</td>

                  {periods.map((_, i) => {
                    const subject =
                      timetable.find(
                        t => t.day === day && t.period === i
                      )?.subject || "-";

                    const isActive =
                      day === currentDay && i === currentPeriod;

                    return (
                      <td
                        key={i}
                        className={`border p-2 ${
                          isActive
                            ? "bg-yellow-300 font-bold"
                            : ""
                        }`}
                      >
                        {subject}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>

          </table>

        </div>
      </div>

    </Layout>
  );
}