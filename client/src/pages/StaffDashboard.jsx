import { useEffect, useState } from "react";
import API from "../lib/api";
import Layout from "../components/Layout";

export default function StaffDashboard() {
  const [staffDetails, setStaffDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This new endpoint fetches the current user's data
    API.get("/auth/me")
      .then((res) => {
        setStaffDetails(res.data);
      })
      .catch((err) => {
        console.error("Failed to fetch staff details", err);
        alert("Could not load staff details.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <Layout>
      <div className="bg-white/80 p-6 rounded-lg shadow-md backdrop-blur-sm border border-white/20">
        <h1 className="text-2xl font-bold mb-6">Staff Dashboard</h1>
        {loading ? (
          <p>Loading your details...</p>
        ) : staffDetails ? (
          <div>
            <h2 className="text-xl font-semibold">Welcome, {staffDetails.name}</h2>
            <div className="mt-4 space-y-2">
              <p><strong>Email:</strong> {staffDetails.email}</p>
              <p><strong>Role:</strong> {staffDetails.role}</p>
              <p><strong>Department:</strong> {staffDetails.department}</p>
              <p><strong>Designation:</strong> {staffDetails.designation}</p>
            </div>
          </div>
        ) : (
          <p className="text-red-500">Could not load staff details.</p>
        )}
      </div>
    </Layout>
  );
}