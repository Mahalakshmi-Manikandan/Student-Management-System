import { useState } from "react";
import API from "../lib/api";

export default function AdminTimetableBuilder() {

  const days = ["MON","TUE","WED","THU","FRI","SAT"];
  const periods = [1,2,3,4,5,6,7,8];

  const [department, setDepartment] = useState("");
  const [year, setYear] = useState("");

  const [table, setTable] = useState({});

  // Handle input change
  const handleChange = (day, period, value) => {
    setTable(prev => ({
      ...prev,
      [`${day}-${period}`]: value
    }));
  };

  // Save timetable
  const handleSave = async () => {

    if (!department || !year) {
      return alert("Enter department & year");
    }

    const formattedData = [];

    Object.keys(table).forEach(key => {
      const [day, period] = key.split("-");

      formattedData.push({
        day,
        period: Number(period),
        subject: table[key]
      });
    });

    try {
      await API.post("/admin/save-timetable", {
        department,
        year,
        timetable: formattedData
      });

      alert("Timetable Saved Successfully");
    } catch (err) {
      alert("Error saving timetable");
    }
  };

  return (
    <div className="p-4 bg-white shadow rounded">

      <h2 className="text-xl font-bold mb-4">
        Create Timetable
      </h2>

      {/* Inputs */}
      <div className="flex gap-4 mb-4">
        <input
          placeholder="Department"
          value={department}
          onChange={(e)=>setDepartment(e.target.value)}
          className="border p-2"
        />

        <input
          placeholder="Year"
          value={year}
          onChange={(e)=>setYear(e.target.value)}
          className="border p-2"
        />
      </div>

      {/* Table */}
      <div className="overflow-auto">
        <table className="border w-full text-center">

          <thead>
            <tr className="bg-gray-200">
              <th>Day</th>
              {periods.map(p => (
                <th key={p}>P{p}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {days.map(day => (
              <tr key={day}>
                <td className="font-bold">{day}</td>

                {periods.map(period => (
                  <td key={period} className="border">
                    <input
                      type="text"
                      placeholder="Subject"
                      value={table[`${day}-${period}`] || ""}
                      onChange={(e)=>
                        handleChange(day, period, e.target.value)
                      }
                      className="w-full p-1 text-center"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>

        </table>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className="mt-4 bg-blue-600 text-white px-6 py-2 rounded"
      >
        Save Timetable
      </button>

    </div>
  );
}