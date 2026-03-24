import { useState } from "react";
import API from "../lib/api";
import { Link } from "react-router-dom";

export default function Register() {
  const [role, setRole] = useState("student");

  const [form, setForm] = useState({
    name: "",
    department: "",
    course: "",
    duration: "",
    designation: "",
    year: "",
    email: "",
    password: "",
    role:""
  });

  const submit = async () => {
    try {
      await API.post("/auth/register", {
        ...form,
        role: role
      });

      alert("Registered successfully.");
    } catch (err) {
      alert(err.response?.data?.message || "Registration Failed");
    }
  };

  return (
    <div className="flex h-screen">

      {/* LEFT SIDE FORM */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-100 relative">

        {/* LOGO */}
        <img
          src="/college.png"
          alt="logo"
          className="absolute top-6 left-6 w-14"
        />

        {/* FIXED SIZE CARD */}
        <div className="bg-white rounded-2xl shadow-xl w-[420px] h-[600px] p-6 flex flex-col">

          <h2 className="text-2xl font-bold text-gray-800 mb-1">
            Create Account 🎓
          </h2>
          <p className="text-gray-500 mb-4 text-sm">
            Register to continue
          </p>

          {/* SCROLLABLE FORM AREA */}
          <div className="flex-1 overflow-y-auto pr-2">

            {/* ROLE */}
            <select
              className="w-full p-3 mb-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="student">Student</option>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>

            {/* NAME */}
            <input
              placeholder="Full Name"
              className="w-full p-3 mb-3 border rounded-lg"
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            {/* DEPARTMENT */}
            <input
              placeholder="Department"
              className="w-full p-3 mb-3 border rounded-lg"
              onChange={(e) => setForm({ ...form, department: e.target.value })}
            />

            {/* STUDENT */}
            {role === "student" && (
              <>
                <input
                  placeholder="Course"
                  className="w-full p-3 mb-3 border rounded-lg"
                  onChange={(e) => setForm({ ...form, course: e.target.value })}
                />
                <input
                  placeholder="Duration (e.g. 3 Years)"
                  className="w-full p-3 mb-3 border rounded-lg"
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                />
                <input
                  placeholder="Year (e.g. 2nd Year)"
                  className="w-full p-3 mb-3 border rounded-lg"
                  onChange={(e) => setForm({ ...form, year: e.target.value })}
                />
              </>
            )}

            {/* STAFF */}
            {role === "staff" && (
              <input
                placeholder="Designation"
                className="w-full p-3 mb-3 border rounded-lg"
                onChange={(e) => setForm({ ...form, designation: e.target.value })}
              />
            )}

            {/* EMAIL */}
            <input
              type="email"
              placeholder="Email Address"
              className="w-full p-3 mb-3 border rounded-lg"
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />

            {/* PASSWORD */}
            <input
              type="password"
              placeholder="Password"
              className="w-full p-3 mb-3 border rounded-lg"
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />

          </div>

          {/* FIXED BUTTON */}
          <div className="mt-4">
            <button
              onClick={submit}
              className="w-full bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg font-semibold transition"
            >
              Register
            </button>

            <p className="text-sm text-center mt-3 text-gray-600">
              Already have an account?{" "}
              <Link to="/" className="text-blue-600 font-medium hover:underline">
                Login
              </Link>
            </p>
          </div>

        </div>
      </div>

      {/* RIGHT SIDE IMAGE */}
      <div className="hidden md:flex w-1/2 h-full">
        <img
          src="https://img.freepik.com/premium-vector/back-school-illustration_1302918-33836.jpg?semt=ais_rp_progressive&w=740&q=80"
          alt="School Illustration"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}