import { useEffect, useState } from "react";
import API from "../lib/api";
import Layout from "../components/Layout";
import { PieChart, Pie, Tooltip, Cell } from "recharts";

export default function StudentDashboard(){

const [attendance,setAttendance]=useState([]);
const [assignments,setAssignments]=useState([]);
const [planner,setPlanner]=useState([]);

const COLORS=["#2563eb","#16a34a","#f59e0b","#ef4444"];

useEffect(()=>{

API.get("/student/attendance")
.then(res=>setAttendance(res.data))

API.get("/student/assignments")
.then(res=>setAssignments(res.data))

API.get("/student/planner")
.then(res=>setPlanner(res.data))

},[])

const totalAttendance =
attendance.length === 0
? 0
: Math.round(
attendance.reduce((a,b)=>a+b.percentage,0)/attendance.length
)

return(

<Layout>

<h1 className="text-2xl font-bold mb-6">
Student Dashboard
</h1>

{/* TOP STATS */}

<div className="grid grid-cols-3 gap-6 mb-8">

<div className="bg-white shadow p-5 rounded">
<h3 className="text-gray-500">Total Attendance</h3>
<p className="text-3xl font-bold">{totalAttendance}%</p>
</div>

<div className="bg-white shadow p-5 rounded">
<h3 className="text-gray-500">Pending Assignments</h3>
<p className="text-3xl font-bold">{assignments.length}</p>
</div>

<div className="bg-white shadow p-5 rounded">
<h3 className="text-gray-500">Today's Classes</h3>
<p className="text-3xl font-bold">5</p>
</div>

</div>

{/* CHARTS */}

<div className="grid grid-cols-2 gap-6 mb-8">

<div className="bg-white p-6 shadow rounded">

<h2 className="font-semibold mb-4">
Attendance Chart
</h2>

<PieChart width={350} height={250}>

<Pie
data={attendance}
dataKey="percentage"
nameKey="subject"
outerRadius={90}
label
>

{attendance.map((entry,index)=>(
<Cell
key={index}
fill={COLORS[index % COLORS.length]}
/>
))}

</Pie>

<Tooltip/>

</PieChart>

</div>

<div className="bg-white p-6 shadow rounded">

<h2 className="font-semibold mb-4">
Weekly Study Time
</h2>

<ul>

{planner.map(p=>(
<li key={p.id}>
{p.goal} - {p.study_time}
</li>
))}

</ul>

</div>

</div>

{/* TABLES */}

<div className="grid grid-cols-2 gap-6">

<div className="bg-white p-6 shadow rounded">

<h2 className="font-semibold mb-4">
Assignments
</h2>

<table className="w-full">

<thead>

<tr className="text-left border-b">
<th>Title</th>
<th>Subject</th>
<th>Due</th>
</tr>

</thead>

<tbody>

{assignments.map(a=>(
<tr key={a.id} className="border-b">
<td>{a.title}</td>
<td>{a.subject}</td>
<td>{a.due_date}</td>
</tr>
))}

</tbody>

</table>

</div>

<div className="bg-white p-6 shadow rounded">

<h2 className="font-semibold mb-4">
Timetable
</h2>

<p>Timetable will appear here</p>

</div>

</div>

</Layout>

)

}