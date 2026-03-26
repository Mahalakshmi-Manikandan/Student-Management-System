import { useEffect, useState } from "react";
import API from "../lib/api";
import Navbar from "../components/Navbar";

export default function AdminCRUD() {
  const [admins, setAdmins] = useState([]);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    department: ""
  });

  const [editId, setEditId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // ===== FETCH ADMINS =====
  const fetchAdmins = async () => {
    try {
      const res = await API.get("/admin/users", {
        params: { role: "admin" }
      });
      setAdmins(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  // ===== HANDLE INPUT =====
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ===== OPEN MODAL (ADD) =====
  const openAddModal = () => {
    setForm({ name: "", email: "", password: "", department: "" });
    setEditId(null);
    setShowModal(true);
  };

  // ===== OPEN MODAL (EDIT) =====
  const handleEdit = (admin) => {
    setForm({
      name: admin.name,
      email: admin.email,
      password: "",
      department: admin.department || ""
    });
    setEditId(admin.id);
    setShowModal(true);
  };

  // ===== SUBMIT =====
  const handleSubmit = async () => {
    try {
      if (editId) {
        await API.put(`/admin/users/${editId}`, {
          ...form,
          role: "admin"
        });
        alert("Updated successfully");
      } else {
        await API.post("/admin/users", {
          ...form,
          role: "admin"
        });
        alert("Added successfully");
      }

      setShowModal(false);
      fetchAdmins();

    } catch (err) {
      alert("Error");
    }
  };

  // ===== DELETE =====
  const handleDelete = async (id) => {
    if (!window.confirm("Delete admin?")) return;

    try {
      await API.delete(`/admin/users/${id}`);
      fetchAdmins();
    } catch {
      alert("Delete failed");
    }
  };

  // ===== FILTER =====
  const filteredAdmins = admins.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      className="min-h-screen bg-white bg-contain bg-no-repeat bg-center bg-fixed"
      style={{ backgroundImage: "url('/college.png')" }}
    >
      <Navbar />

      <div className="p-6">
        <div className="bg-white/80 p-6 rounded-lg shadow-md backdrop-blur-sm border border-white/20">

        <h1 className="text-2xl font-bold mb-6">Admin Management</h1>

        {/* ===== TOP BAR ===== */}
        <div className="flex justify-between mb-4 gap-4">

          <input
            type="text"
            placeholder="Search by name..."
            className="border p-2 w-full rounded-md"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button
            onClick={openAddModal}
            className="bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded-md"
          >
            Add
          </button>

        </div>

        {/* ===== TABLE ===== */}
        <table className="w-full border text-center">

          <thead className="bg-slate-100">
            <tr>
              <th className="p-2">Name</th>
              <th>Email</th>
              <th>Department</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredAdmins.map((admin) => (
              <tr key={admin.id} className="border">

                <td className="p-2">{admin.name}</td>
                <td>{admin.email}</td>
                <td>{admin.department}</td>

                <td className="flex gap-2 justify-center p-2">

                  <button
                    onClick={() => handleEdit(admin)}
                    className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded-md"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(admin.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md"
                  >
                    Delete
                  </button>

                </td>

              </tr>
            ))}
          </tbody>

        </table>
        </div>

      </div>

      {/* ===== MODAL ===== */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">

          <div className="bg-white/95 p-6 rounded-lg w-[400px] backdrop-blur-sm border border-white/20">

            <h2 className="text-lg font-bold mb-4">
              {editId ? "Edit Admin" : "Add Admin"}
            </h2>

            <div className="flex flex-col gap-3">

              <input
                name="name"
                placeholder="Name"
                value={form.name}
                onChange={handleChange}
                className="border p-2 rounded-md"
              />

              <input
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                className="border p-2 rounded-md"
              />

              {!editId && (
                <input
                  name="password"
                  type="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                  className="border p-2 rounded-md"
                />
              )}

              <input
                name="department"
                placeholder="Department"
                value={form.department}
                onChange={handleChange}
                className="border p-2 rounded-md"
              />

            </div>

            <div className="flex justify-end gap-2 mt-4">

              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-md"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                className="bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded-md"
              >
                {editId ? "Update" : "Add"}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}