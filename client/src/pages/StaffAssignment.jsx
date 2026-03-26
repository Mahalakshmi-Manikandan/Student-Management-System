import { useEffect, useState } from "react";
import API from "../lib/api";
import Layout from "../components/Layout";

export default function StaffAssignment() {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [due, setDue] = useState("");
  const [year, setYear] = useState("");

  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);

  const [department, setDepartment] = useState("");
  const [course, setCourse] = useState("");

  useEffect(() => {
    // Fetch departments and courses to populate dropdowns
    API.get("/staff/departments").then((res) => setDepartments(res.data));
    API.get("/staff/courses").then((res) => setCourses(res.data));
  }, []);

  const upload = async () => {
    if (!title || !subject || !due || !department || !year) {
      return alert("Please fill all fields, including department and year.");
    }

    const payload = {
      title,
      subject,
      due_date: due,
      department,
      year,
      course, // Course can be optional
    };

    try {
      await API.post("/staff/assignment", payload);
      alert("Assignment uploaded successfully");
      // Reset form
      setTitle("");
      setSubject("");
      setDue("");
      setDepartment("");
      setYear("");
      setCourse("");
    } catch (error) {
      console.error("Upload failed", error);
      alert("Assignment upload failed.");
    }
  };

  return (
    <Layout>
      <div className="bg-white/80 p-6 rounded-lg shadow-md backdrop-blur-sm border border-white/20">
        <h1 className="text-xl font-bold mb-6">Upload Assignment</h1>

        <div className="space-y-4 max-w-lg">
          <input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border p-2 w-full rounded-md"
          />
          <input
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="border p-2 w-full rounded-md"
          />
          <input
            type="date"
            value={due}
            onChange={(e) => setDue(e.target.value)}
            className="border p-2 w-full rounded-md"
          />
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="border p-2 w-full rounded-md"
          >
            <option value="">Select Department</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="border p-2 w-full rounded-md"
          >
            <option value="">Select Year</option>
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
          </select>
          <select
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            className="border p-2 w-full rounded-md"
          >
            <option value="">Select Course (Optional)</option>
            {courses.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <button
            onClick={upload}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 mt-3 rounded-md"
          >
            Upload Assignment
          </button>
        </div>
      </div>
    </Layout>
  );
}