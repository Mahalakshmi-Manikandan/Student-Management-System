import { useEffect, useState } from "react";
import API from "../lib/api";
import Navbar from "../components/Navbar";

export default function AdminStaff() {
  const [staff, setStaff] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    department: "",
    designation: ""
  });

  // Fetch Staff
  const fetchStaff = async () => {
    const res = await API.get("/admin/users", { params: { role: "staff" } });
    setStaff(res.data);
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  // Handle Form Change
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Handle Submit (Add/Update)
  const handleSubmit = async () => {
    try {
      if (editId) {
        await API.put(`/admin/users/${editId}`, { ...form, role: "staff" });
      } else {
        await API.post("/admin/users", { ...form, role: "staff" });
      }
      setShowModal(false);
      fetchStaff();
    } catch (error) {
      alert("Operation failed");
    }
  };

  // Handle Delete
  const handleDelete = async (id) => {
    if (confirm("Are you sure?")) {
      await API.delete(`/admin/users/${id}`);
      fetchStaff();
    }
  };

  // Open Modal
  const openModal = (staffMember = null) => {
    if (staffMember) {
      setEditId(staffMember.id);
      setForm({
        name: staffMember.name,
        email: staffMember.email,
        password: "", // Leave empty to keep unchanged
        department: staffMember.department,
        designation: staffMember.designation || ""
      });
    } else {
      setEditId(null);
      setForm({ name: "", email: "", password: "", department: "", designation: "" });
    }
    setShowModal(true);
  };

  const filteredStaff = staff.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      className="min-h-screen bg-white bg-contain bg-no-repeat bg-center bg-fixed"
      style={{ backgroundImage: "url('/college.png')" }}
    >
      <Navbar />
      <div className="p-6">
        <div className="bg-white/80 p-6 rounded-lg shadow-md backdrop-blur-sm border border-white/20">
        <h1 className="text-2xl font-bold mb-6">Staff Management</h1>

        <div className="flex gap-4 mb-4">
          <input
            placeholder="Search by Name"
            className="border p-2 w-full rounded-md"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button onClick={() => openModal()} className="bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded-md">
            Add Staff
          </button>
        </div>

        <table className="w-full border text-center">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-2">Name</th>
              <th>Email</th>
              <th>Department</th>
              <th>Designation</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStaff.map((s) => (
              <tr key={s.id} className="border">
                <td className="p-2">{s.name}</td>
                <td>{s.email}</td>
                <td>{s.department}</td>
                <td>{s.designation}</td>
                <td className="p-2 gap-2 flex justify-center">
                  <button onClick={() => openModal(s)} className="bg-amber-500 hover:bg-amber-600 text-white px-2 py-1 rounded-md">Edit</button>
                  <button onClick={() => handleDelete(s.id)} className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded-md">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white/95 p-6 rounded-lg w-96 backdrop-blur-sm border border-white/20">
              <h2 className="text-xl font-bold mb-4">{editId ? "Edit Staff" : "Add Staff"}</h2>
              <div className="flex flex-col gap-3">
                <input name="name" placeholder="Name" value={form.name} onChange={handleChange} className="border p-2 rounded-md" />
                <input name="email" placeholder="Email" value={form.email} onChange={handleChange} className="border p-2 rounded-md" />
                {!editId && <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} className="border p-2 rounded-md" />}
                <input name="department" placeholder="Department" value={form.department} onChange={handleChange} className="border p-2 rounded-md" />
                <input name="designation" placeholder="Designation" value={form.designation} onChange={handleChange} className="border p-2 rounded-md" />
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