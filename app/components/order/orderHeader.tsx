'use client'

interface Props {
  type?: 'dine-in' | 'parcel'
  parcelNumber?: number
  tableNumber?: number
}

export default function OrderHeader({
  type,
  parcelNumber,
  tableNumber
}: Props){

let label = ''

if(type === 'parcel'){
  label = `Parcel #${parcelNumber}`
}

if(type === 'dine-in'){
  label = `Table ${tableNumber}`
}

return(

<div className="border-b pb-3 mb-4">

  <h2 className="text-xl font-bold">
    {label || 'Order'}
  </h2>

</div>

)

}