'use client'

import { useState } from 'react'

export default function useOrder(){

const [order,setOrder] = useState<any>(null)
const [items,setItems] = useState<any[]>([])
const [loading,setLoading] = useState(true)

const fetchOrder = async(orderId:string)=>{

try{

const res = await fetch(`/api/counter/orders/${orderId}`, {
  cache: 'no-store'
});

if(!res.ok) return

const data = await res.json()

setOrder(data.order)
setItems(data.items || [])

}catch(err){
console.error(err)
}finally{
setLoading(false)
}

}

const addItem = async(orderId:string,menuItemId:string)=>{

try{

await fetch(`/api/counter/orders/${orderId}/add`,{
method:'POST',
headers:{'Content-Type':'application/json'},
body:JSON.stringify({menuItemId})
})

await fetchOrder(orderId)

}catch(err){
console.error(err)
}

}

return{

order,
items,
loading,

fetchOrder,
addItem,

setItems

}

}