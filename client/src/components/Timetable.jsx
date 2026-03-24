import { useEffect, useState } from "react";
import API from "../lib/api";

export default function Timetable() {

  const [timetable, setTimetable] = useState([]);
  const [currentPeriod, setCurrentPeriod] = useState(null);

  useEffect(() => {

    // fetch timetable
    API.get("/student/timetable").then((res) => {
      setTimetable(res.data);
    });

    // detect current hour
    const currentHour = new Date().getHours();

    if (currentHour === 9) setCurrentPeriod(1);
    else if (currentHour === 10) setCurrentPeriod(2);
    else if (currentHour === 11) setCurrentPeriod(3);
    else if (currentHour === 12) setCurrentPeriod(4);
    else if (currentHour === 14) setCurrentPeriod(5);
    else if (currentHour === 15) setCurrentPeriod(6);

  }, []);

  return (
    <div className="bg-white p-4 shadow rounded">

      <h2 className="text-xl font-bold mb-4">Today's Timetable</h2>

      <table className="w-full border">

        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Period</th>
            <th className="border p-2">Subject</th>
            <th className="border p-2">Staff</th>
          </tr>
        </thead>

        <tbody>

          {timetable.map((item) => (

            <tr
              key={item.period}
              className={currentPeriod === item.period ? "bg-green-200" : ""}
            >
              <td className="border p-2">{item.period}</td>
              <td className="border p-2">{item.subject}</td>
              <td className="border p-2">{item.staff}</td>
            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}