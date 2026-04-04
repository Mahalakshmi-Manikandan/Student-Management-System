import { useEffect, useState, useCallback } from "react";
import API from "../lib/api";
import Layout from "../components/Layout";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import {
  CheckCircle, Circle, Plus, X, BookOpen, Clock, CalendarCheck, UserCircle, Download,
} from "lucide-react";

const SERVER = "http://localhost:5000";

// ── Period time ranges (minutes from midnight) ───────────────────────────────
const PERIOD_TIMES = [
  { start: 9 * 60 + 30, end: 10 * 60 + 20 },
  { start: 10 * 60 + 20, end: 11 * 60 + 10 },
  { start: 11 * 60 + 20, end: 12 * 60 + 10 },
  { start: 12 * 60 + 10, end: 13 * 60 + 0 },
  { start: 13 * 60 + 50, end: 14 * 60 + 30 },
  { start: 14 * 60 + 30, end: 15 * 60 + 10 },
  { start: 15 * 60 + 20, end: 16 * 60 + 0 },
  { start: 16 * 60 + 0,  end: 16 * 60 + 40 },
];
const PERIOD_LABELS = [
  "9:30-10:20","10:20-11:10","11:20-12:10","12:10-1:00",
  "1:50-2:30","2:30-3:10","3:20-4:00","4:00-4:40",
];
const BAR_COLORS = ["#3b82f6","#10b981","#f59e0b","#ef4444","#8b5cf6","#ec4899","#06b6d4","#84cc16"];

function getNowMinutes() {
  const n = new Date(); return n.getHours() * 60 + n.getMinutes();
}
function getActivePeriodIndex() {
  const m = getNowMinutes();
  return PERIOD_TIMES.findIndex((p) => m >= p.start && m < p.end);
}
function getTodayKey() {
  return new Date().toLocaleString("en-US", { weekday: "short" }).toUpperCase();
}
function getRemainingClasses(timetable) {
  const day = getTodayKey();
  const m = getNowMinutes();
  return timetable.filter(
    (t) => t.day === day && t.period >= 1 && t.period <= 8 && PERIOD_TIMES[t.period - 1]?.end > m
  ).length;
}
function formatDate(d) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
function parsePlanGoal(goal = "") {
  const parts = goal.split(" | ");
  return { title: parts[0] || goal, subject: parts[1] || "" };
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, color }) {
  return (
    <div className={`rounded-xl p-5 shadow border border-white/30 backdrop-blur-sm ${color}`}>
      <div className="flex items-center gap-2 mb-2 opacity-80">
        {icon}
        <p className="text-sm font-medium">{label}</p>
      </div>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}

export default function StudentDashboard() {
  const [studentInfo, setStudentInfo] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [planner, setPlanner] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [timetableFileUrl, setTimetableFileUrl] = useState(null);

  // Planner form
  const [showForm, setShowForm] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formSubject, setFormSubject] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formSaving, setFormSaving] = useState(false);

  const fetchAll = useCallback(() => {
    API.get("/auth/me").then((r) => setStudentInfo(r.data)).catch(() => {});
    API.get("/student/attendance").then((r) => setAttendance(r.data)).catch(() => {});
    API.get("/student/assignments").then((r) => setAssignments(r.data)).catch(() => {});
    API.get("/student/planner").then((r) => setPlanner(r.data)).catch(() => {});
    API.get("/student/timetable").then((r) => setTimetable(r.data)).catch(() => {});
    API.get("/student/timetable-file").then((r) => setTimetableFileUrl(r.data.file_path || null)).catch(() => {});
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Derived stats
  const overallAttendance =
    attendance.length === 0
      ? 0
      : Math.round(attendance.reduce((s, a) => s + a.percentage, 0) / attendance.length);
  const pendingCount = assignments.filter((a) => !a.completed).length;
  const todayRemaining = getRemainingClasses(timetable);
  const activePeriodIdx = getActivePeriodIndex();
  const todayKey = getTodayKey();

  // Today's slots (all 8 periods)
  const todaySlots = PERIOD_LABELS.map((label, idx) => {
    const entry = timetable.find((t) => t.day === todayKey && t.period === idx + 1);
    return { label, subject: entry?.subject || "-", isActive: activePeriodIdx === idx };
  });

  // Toggle assignment complete
  // const toggleAssignment = (id, current) => {
  //   const next = current ? 0 : 1;
  //   setAssignments((prev) => prev.map((a) => (a.id === id ? { ...a, completed: next } : a)));
  //   API.patch(`/student/assignments/${id}/status`, { completed: next }).catch(() => {
  //     setAssignments((prev) => prev.map((a) => (a.id === id ? { ...a, completed: current } : a)));
  //   });
  // };

  // Create study plan
  const handleCreatePlan = async (e) => {
    e.preventDefault();
    if (!formTitle || !formDate) return;
    const goal = formSubject ? `${formTitle} | ${formSubject}` : formTitle;
    try {
      setFormSaving(true);
      await API.post("/student/planner", { goal, study_time: formDate });
      setFormTitle(""); setFormSubject(""); setFormDate(""); setShowForm(false);
      API.get("/student/planner").then((r) => setPlanner(r.data));
    } catch (err) {
      console.error("Failed to save plan", err);
    } finally { setFormSaving(false); }
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Student Dashboard</h1>

      {/* Top 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <StatCard
          icon={<CalendarCheck className="w-5 h-5" />}
          label="Total Attendance"
          value={`${overallAttendance}%`}
          color="bg-blue-100/80 text-blue-900"
        />
        {/* <StatCard
          icon={<BookOpen className="w-5 h-5" />}
          label="Pending Assignments"
          value={pendingCount}
          color="bg-amber-100/80 text-amber-900"
        /> */}
        <StatCard
          icon={<Clock className="w-5 h-5" />}
          label="Today's Remaining Classes"
          value={todayRemaining}
          color="bg-green-100/80 text-green-900"
        />
        <StatCard
          icon={<UserCircle className="w-5 h-5" />}
          label="Student"
          value={studentInfo ? studentInfo.name : "—"}
          color="bg-purple-100/80 text-purple-900"
        />
      </div>

      {/* Student info strip */}
      {studentInfo && (
        <div className="bg-white/70 rounded-xl px-5 py-3 mb-6 border border-white/20 backdrop-blur-sm flex flex-wrap gap-x-8 gap-y-1 text-sm text-gray-600">
          <span><span className="font-medium text-gray-700">Dept:</span> {studentInfo.department}</span>
          <span><span className="font-medium text-gray-700">Course:</span> {studentInfo.course}</span>
          <span><span className="font-medium text-gray-700">Year:</span> {studentInfo.year}</span>
          <span><span className="font-medium text-gray-700">Email:</span> {studentInfo.email}</span>
        </div>
      )}

      {/* Row 2: Bar Chart + Timetable */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        {/* Attendance Bar Chart */}
        <div className="bg-white/80 p-6 rounded-xl shadow backdrop-blur-sm border border-white/20">
          <h2 className="font-semibold mb-4 text-gray-800">Attendance by Subject</h2>
          {attendance.length === 0 ? (
            <div className="flex items-center justify-center h-52 text-gray-400 text-sm border-2 border-dashed rounded-xl">
              No attendance data available.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={attendance} margin={{ top: 4, right: 10, left: -10, bottom: 44 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="subject" tick={{ fontSize: 11, fill: "#64748b" }} angle={-35} textAnchor="end" interval={0} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#64748b" }} unit="%" />
                <Tooltip
                  formatter={(v, _n, props) => [`${v}% (${props.payload.present}/${props.payload.total})`, "Attendance"]}
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                />
                <Bar dataKey="percentage" radius={[4, 4, 0, 0]}>
                  {attendance.map((_, i) => <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Today's Timetable */}
        <div className="bg-white/80 p-6 rounded-xl shadow backdrop-blur-sm border border-white/20">
          <h2 className="font-semibold mb-4 text-gray-800">
            Today&apos;s Timetable
            <span className="ml-2 text-xs text-gray-400 font-normal">({todayKey})</span>
          </h2>
          {timetable.length === 0 ? (
            <div className="flex items-center justify-center h-52 text-gray-400 text-sm border-2 border-dashed rounded-xl">
              No timetable data available.
            </div>
          ) : (
            <div className="space-y-1.5 overflow-y-auto max-h-60">
              {todaySlots.map((slot, i) => (
                <div key={i}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm border transition-colors ${
                    slot.isActive
                      ? "bg-blue-100 border-blue-300 font-semibold text-blue-900"
                      : "bg-slate-50 border-transparent text-gray-700"
                  }`}>
                  <span className="text-xs text-gray-400 w-28 shrink-0">{slot.label}</span>
                  <span className="flex-1">{slot.subject}</span>
                  {slot.isActive && (
                    <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full shrink-0">Now</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Row 3: Assignments + Study Planner */}
      <div >

        {/* Assignment List */}
        {/* <div className="bg-white/80 p-6 rounded-xl shadow backdrop-blur-sm border border-white/20">
          <h2 className="font-semibold mb-4 text-gray-800 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-500" /> Assignments
          </h2>
          {assignments.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed rounded-xl text-gray-400 text-sm">
              No assignments assigned yet.
            </div>
          ) : (
            <div className="space-y-2 overflow-y-auto max-h-72">
              {assignments.map((a) => (
                <div key={a.id}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-sm transition-all ${
                    a.completed ? "bg-green-50 border-green-200 opacity-75" : "bg-white border-gray-200"
                  }`}>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate ${a.completed ? "line-through text-gray-400" : "text-gray-800"}`}>
                      {a.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{a.subject} · Due: {formatDate(a.due_date)}</p>
                  </div>
                  <button onClick={() => toggleAssignment(a.id, a.completed)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
                      a.completed
                        ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        : "bg-green-500 text-white hover:bg-green-600"
                    }`}>
                    {a.completed
                      ? <><Circle className="w-3.5 h-3.5" /> Undo</>
                      : <><CheckCircle className="w-3.5 h-3.5" /> Done</>}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div> */}

        {/* Study Planner */}
        <div className="bg-white/80 p-6 rounded-xl shadow backdrop-blur-sm border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-500" /> Study Planner
            </h2>
            <button onClick={() => setShowForm((v) => !v)}
              className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors">
              {showForm ? <><X className="w-4 h-4" /> Cancel</> : <><Plus className="w-4 h-4" /> Create Plan</>}
            </button>
          </div>

          {/* Create form */}
          {showForm && (
            <form onSubmit={handleCreatePlan}
              className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-xl space-y-3">
              <div>
                <label className="block text-xs font-medium text-purple-800 mb-1">Title *</label>
                <input type="text" placeholder="e.g. Study Chapter 5" value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)} required
                  className="w-full border border-purple-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
              </div>
              <div>
                <label className="block text-xs font-medium text-purple-800 mb-1">Subject</label>
                <input type="text" placeholder="e.g. Mathematics" value={formSubject}
                  onChange={(e) => setFormSubject(e.target.value)}
                  className="w-full border border-purple-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
              </div>
              <div>
                <label className="block text-xs font-medium text-purple-800 mb-1">Finish Date *</label>
                <input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} required
                  className="w-full border border-purple-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
              </div>
              <button type="submit" disabled={formSaving}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white py-2 rounded-lg text-sm font-semibold">
                {formSaving ? "Saving..." : "Save Plan"}
              </button>
            </form>
          )}

          {/* Planner list */}
          {planner.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed rounded-xl text-gray-400 text-sm">
              No study plans yet. Click <strong>Create Plan</strong> to add one.
            </div>
          ) : (
            <div className="space-y-2 overflow-y-auto max-h-64">
              {planner.map((p) => {
                const { title, subject } = parsePlanGoal(p.goal);
                return (
                  <div key={p.id}
                    className="flex items-center justify-between gap-3 px-4 py-3 rounded-lg border border-gray-200 bg-white text-sm">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate">{title}</p>
                      {subject && <p className="text-xs text-gray-400 mt-0.5">{subject}</p>}
                    </div>
                    <span className="text-xs text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-full shrink-0 whitespace-nowrap">
                      {formatDate(p.study_time)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </Layout>
  );
}
