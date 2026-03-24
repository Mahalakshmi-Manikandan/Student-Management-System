import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem("accessToken");
  const userRole = localStorage.getItem("role");

  if (!token) return <Navigate to="/" />;

  if (role && role !== userRole) return <Navigate to="/" />;

  return children;
}