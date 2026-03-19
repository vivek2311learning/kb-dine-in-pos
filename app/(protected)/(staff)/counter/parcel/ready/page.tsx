'use client'

import { useEffect, useState } from 'react'

interface Parcel {
  _id: string
  parcelNumber: number
}

export default function ReadyParcels() {
  const [orders, setOrders] = useState<Parcel[]>([])
  const [loading, setLoading] = useState(true)

  /* ================= FETCH ================= */

  const fetchReady = async () => {
    try {
      const res = await fetch('/api/counter/parcel/ready', {
        cache: 'no-store',
        credentials: 'include',
      })

      if (!res.ok) return

      const data = await res.json()

      setOrders(data)

    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  /* ================= POLLING ================= */

  useEffect(() => {
    fetchReady()

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchReady()
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  /* ================= UI ================= */

  if (loading) {
    return <div className="p-6 text-gray-500">Loading...</div>
  }

  return (
    <div className="p-6">

      <h1 className="text-xl font-bold mb-6">
        Ready Parcels
      </h1>

      <div className="space-y-3">

        {orders.map(o => (
          <div
            key={o._id}
            className="border p-4 rounded flex justify-between items-center bg-green-50"
          >
            <span className="font-semibold">
              Parcel #{o.parcelNumber}
            </span>

            <span className="text-green-600 text-sm">
              Ready
            </span>
          </div>
        ))}

        {!orders.length && (
          <div className="text-gray-500 text-center">
            No ready parcels
          </div>
        )}

      </div>

    </div>
  )
}