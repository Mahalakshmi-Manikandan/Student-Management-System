import { useState } from "react";
import API from "../lib/api";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const login = async () => {
    if (!email || !password) {
      return alert("Please enter email and password");
    }

    try {
      setLoading(true);

      const res = await API.post("/auth/login", { email, password });

      console.log("LOGIN RESPONSE:", res.data);

      const { accessToken, refreshToken, role } = res.data;

      if (!accessToken || !role) {
        alert("Invalid server response");
        return;
      }

      // Store data
      localStorage.setItem("accessToken", accessToken);
      if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("role", role);

      // 🔥 Force redirect (stronger than navigate if issue exists)
      if (role === "admin") {
       navigate("/admin");
      } else if (role === "staff") {
        navigate("/staff");
      } else if (role === "student") {
        navigate("/student")
      } else {
        window.location.href = "/";
      }

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen">

      {/* LEFT IMAGE */}
      <div className="hidden md:flex w-1/2 h-full">
        <img
          src="https://img.freepik.com/premium-vector/back-school-illustration_1302918-33836.jpg?semt=ais_rp_progressive&w=740&q=80"
          alt="School"
          className="w-full h-full object-cover"
        />
      </div>

      {/* RIGHT SIDE */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-100 relative">

        {/* LOGO */}
        <img
          src="/college.png"
          alt="College Logo"
          className="absolute top-6 right-6 w-16"
        />

        {/* CARD */}
        <div className="bg-white p-10 rounded-2xl shadow-lg w-[90%] max-w-md">

          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome Back 👋
          </h2>

          <p className="text-gray-500 mb-6">
            Please login to your account
          </p>

          {/* EMAIL */}
          <div className="mb-4">
            <label className="text-sm text-gray-600">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full mt-1 p-3 border rounded-lg"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* PASSWORD */}
          <div className="mb-4 relative">
            <label className="text-sm text-gray-600">Password</label>

            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              className="w-full mt-1 p-3 border rounded-lg pr-12"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[38px] text-sm text-blue-600"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {/* BUTTON */}
          <button
            onClick={login}
            disabled={loading}
            className="w-full bg-blue-600 text-white p-3 rounded-lg"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {/* FOOTER */}
          <p className="text-sm text-center mt-4 text-gray-600">
            Don’t have an account?{" "}
            <Link to="/register" className="text-blue-600">
              Register
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}