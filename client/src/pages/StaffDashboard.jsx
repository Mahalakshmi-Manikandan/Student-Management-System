import { useState } from "react";
import API from "../lib/api";
import Layout from "../components/Layout";

export default function StaffDashboard(){

const [title,setTitle]=useState("")
const [subject,setSubject]=useState("")
const [due,setDue]=useState("")
const [file,setFile]=useState(null)

const upload=async()=>{

const form=new FormData()

form.append("title",title)
form.append("subject",subject)
form.append("due_date",due)
form.append("file",file)

await API.post("/staff/assignment",form)

alert("Assignment uploaded")

}

return(

<Layout>

<h1 className="text-xl font-bold mb-6">
Upload Assignment
</h1>

<input
placeholder="Title"
onChange={(e)=>setTitle(e.target.value)}
className="border p-2 mb-2"
/>

<input
placeholder="Subject"
onChange={(e)=>setSubject(e.target.value)}
className="border p-2 mb-2"
/>

<input
type="date"
onChange={(e)=>setDue(e.target.value)}
className="border p-2 mb-2"
/>

<input
type="file"
onChange={(e)=>setFile(e.target.files[0])}
/>

<button
onClick={upload}
className="bg-blue-500 text-white px-4 py-2 mt-3"
>
Upload
</button>

</Layout>

)

}