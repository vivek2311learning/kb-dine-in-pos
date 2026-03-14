'use client'

import { useEffect,useState } from 'react'
import { Card } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'

export default function AdminRevenuePage(){

const [data,setData] = useState<any[]>([])
const [from,setFrom] = useState('')
const [to,setTo] = useState('')

const fetchRevenue = async()=>{

let url='/api/admin/revenue'

if(from && to){
  url+=`?from=${from}&to=${to}`
}

const res = await fetch(url,{cache:'no-store'})
const result = await res.json()

setData(result)

}

useEffect(()=>{
fetchRevenue()
},[])

const total = data.reduce(
(sum,b)=>sum+b.totalAmount,
0
)

return(

<div className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto">

<h1 className="text-3xl font-bold">
Revenue
</h1>

{/* FILTER */}

<Card className="p-4 flex flex-wrap gap-4 items-end">

<div>

<label className="text-sm" htmlFor='date'>
From
</label>

<input
id='date'
type="date"
value={from}
onChange={(e)=>setFrom(e.target.value)}
className="border p-2 rounded"
/>

</div>

<div>

<label className="text-sm" htmlFor='date-to'>
To
</label>

<input
id='date-to'

type="date"
value={to}
onChange={(e)=>setTo(e.target.value)}
className="border p-2 rounded"
/>

</div>

<Button onClick={fetchRevenue}>
Apply
</Button>

</Card>

{/* TOTAL */}

<Card className="p-6 text-center">

<p className="text-sm text-gray-500">
Total Revenue
</p>

<p className="text-3xl font-bold mt-2">
₹{total}
</p>

</Card>

{/* LIST */}

<Card className="p-6 space-y-3">

<h2 className="font-semibold">
Bills
</h2>

{data.map((bill:any)=>(
<div key={bill._id} className="flex justify-between border-b py-2">

<span>
Bill #{bill.billNumber}
</span>

<span>
₹{bill.totalAmount}
</span>

</div>
))}

</Card>

</div>

)

}