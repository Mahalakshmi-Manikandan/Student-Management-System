import { useEffect, useState } from "react";
import API from "../lib/api";
import Navbar from "../components/Navbar";
import * as XLSX from "xlsx";

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [department, setDepartment] = useState("");
  const [course, setCourse] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    department: "",
    course: "",
    duration: "",
    year: "",
  });

  const fetchStudents = async () => {
    try {
      const res = await API.get("/admin/users", { params: { role: "student" } });
      setStudents(res.data);
    } catch (err) {
      alert("Failed to fetch students.");
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    const filtered = students.filter(s =>
      (s.department || "").toLowerCase().includes(department.toLowerCase()) &&
      (s.course || "").toLowerCase().includes(course.toLowerCase())
    );
    setFilteredStudents(filtered);
  }, [department, course, students]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    try {
      const payload = { ...form, role: "student" };
      if (editId) {
        if (!payload.password) delete payload.password;
        await API.put(`/admin/users/${editId}`, payload);
      } else {
        await API.post("/admin/users", payload);
      }
      setShowModal(false);
      fetchStudents();
    } catch (error) {
      alert(error.response?.data?.message || "Operation failed");
    }
  };

  const handleExport = () => {
    const dataToExport = filteredStudents.map((student) => ({
      Name: student.name,
      Department: student.department,
      Course: student.course,
      Email: student.email,
    }));
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    XLSX.writeFile(wb, "students.xlsx");
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      try {
        await API.delete(`/admin/users/${id}`);
        fetchStudents();
      } catch (error) {
        alert("Delete failed");
      }
    }
  };

  const openModal = (student = null) => {
    if (student) {
      setEditId(student.id);
      setForm({
        name: student.name || "",
        email: student.email || "",
        password: "", // Leave empty to keep unchanged
        department: student.department || "",
        course: student.course || "",
        duration: student.duration || "",
        year: student.year || "",
      });
    } else {
      setEditId(null);
      setForm({ name: "", email: "", password: "", department: "", course: "", duration: "", year: "" });
    }
    setShowModal(true);
  };

  return (
    <div
      className="min-h-screen bg-white bg-contain bg-no-repeat bg-center bg-fixed print:bg-transparent"
      style={{ backgroundImage: "url('/college.png')" }}
    >
    
      <div className="print:hidden">
        <Navbar />
      </div>
      <div className="p-6">
        <div className="bg-white/80 p-6 rounded-lg shadow-md backdrop-blur-sm border border-white/20 print:bg-transparent print:shadow-none print:backdrop-blur-none">
        <h1 className="text-2xl font-bold mb-6">Student Management</h1>

        <div className="flex gap-4 mb-4 print:hidden">
          <input
            type="text"
            placeholder="Filter by Department"
            className="border p-2 w-full rounded-md"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          />
          <input
            type="text"
            placeholder="Filter by Course"
            className="border p-2 w-full rounded-md"
            value={course}
            onChange={(e) => setCourse(e.target.value)}
          />
          <button onClick={() => openModal()} className="bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded-md">
            Add Student
          </button>
          <button
            onClick={() => window.print()}
            className="bg-slate-500 hover:bg-slate-600 text-white px-4 py-2 rounded-md"
          >
            Print
          </button>
          <button
            onClick={handleExport}
            className="bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded-md"
          >
            Export Excel
          </button>
        </div>

        <table className="w-full border text-center">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-2">Name</th>
              <th>Email</th>
              <th>Department</th>
              <th>Course</th>
              <th className="print:hidden">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student) => (
              <tr key={student.id} className="border">
                <td className="p-2">{student.name}</td>
                <td>{student.email}</td>
                <td>{student.department}</td>
                <td>{student.course}</td>
                <td className="p-2 gap-2 flex justify-center print:hidden">
                  <button onClick={() => openModal(student)} className="bg-amber-500 hover:bg-amber-600 text-white px-2 py-1 rounded-md">Edit</button>
                  <button onClick={() => handleDelete(student.id)} className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded-md">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white/95 p-6 rounded-lg w-96 backdrop-blur-sm border border-white/20">
              <h2 className="text-xl font-bold mb-4">{editId ? "Edit Student" : "Add Student"}</h2>
              <div className="flex flex-col gap-3 h-96 overflow-y-auto pr-2">
                <input name="name" placeholder="Name" value={form.name} onChange={handleChange} className="border p-2 rounded-md" />
                <input name="email" placeholder="Email" value={form.email} onChange={handleChange} className="border p-2 rounded-md" />
                <input name="password" type="password" placeholder={editId ? "New Password (optional)" : "Password"} value={form.password} onChange={handleChange} className="border p-2 rounded-md" />
                <input name="department" placeholder="Department" value={form.department} onChange={handleChange} className="border p-2 rounded-md" />
                <input name="course" placeholder="Course" value={form.course} onChange={handleChange} className="border p-2 rounded-md" />
                <input name="duration" placeholder="Duration (e.g. 3 Years)" value={form.duration} onChange={handleChange} className="border p-2 rounded-md" />
                <input name="year" placeholder="Year (e.g. 2nd Year)" value={form.year} onChange={handleChange} className="border p-2 rounded-md" />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button onClick={() => setShowModal(false)} className="bg-slate-200 hover:bg-slate-300 px-4 py-2 rounded-md">Cancel</button>
                <button onClick={handleSubmit} className="bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded-md">Save</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}