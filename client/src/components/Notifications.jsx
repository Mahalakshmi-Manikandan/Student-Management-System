import { useEffect,useState } from "react";
import API from "../lib/api";

export default function Notifications(){

const [notes,setNotes]=useState([])

useEffect(()=>{

API.get("/notifications")
.then(res=>setNotes(res.data))

},[])

return(

<div className="bg-white shadow p-4">

<h2 className="font-bold mb-3">
Notifications
</h2>

{notes.map(n=>(
<div key={n.id} className="border-b py-2">
<b>{n.title}</b>
<p>{n.message}</p>
</div>
))}

</div>

)

}