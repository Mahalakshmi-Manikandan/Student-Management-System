import { useEffect, useState } from "react";
import API from "../lib/api";
import Layout from "../components/Layout";

export default function AdminDashboard() {

  const [metrics, setMetrics] = useState({
    students: 0,
    staff: 0,
    admins: 0
  });

  
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
    // API.get("/admin/dashboard").then(res => {
    //   setMetrics({
    //     students: res.data.students,
    //     staff: res.data.staff,
    //     admins: res.data.admins
    //   });

    //   setTimetable(res.data.timetable || []);
    // });
  API.get("/admin/dashboard").then(res => {
  setMetrics(res.data);
});}, []);

  

  return (
    <Layout>

      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {/* ===== Metrics Cards ===== */}
      <div className="grid grid-cols-3 gap-4 mb-8">

        <div className="bg-blue-100/80 text-blue-900 p-4 rounded-lg backdrop-blur-sm border border-white/20">
          <h2>Total Students</h2>
          <p className="text-2xl font-bold">{metrics.students}</p>
        </div>

        <div className="bg-green-100/80 text-green-900 p-4 rounded-lg backdrop-blur-sm border border-white/20">
          <h2>Total Staff</h2>
          <p className="text-2xl font-bold">{metrics.staff}</p>
        </div>

        <div className="bg-purple-100/80 text-purple-900 p-4 rounded-lg backdrop-blur-sm border border-white/20">
          <h2>Total Admins</h2>
          <p className="text-2xl font-bold">{metrics.admins}</p>
        </div>

      </div>

      

      {/* ===== Timetable ===== */}
      <div className="bg-white/80 p-4 shadow rounded-lg backdrop-blur-sm border border-white/20">

        <h2 className="text-xl font-semibold mb-4">
          Weekly Timetable
        </h2>

        <div className="overflow-auto">

          <table className="w-full border text-center">

            <thead className="bg-slate-100">
              <tr>
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
                        className={`border p-2 ${isActive ? "bg-blue-100 font-bold" : ""}`}
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