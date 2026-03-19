'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'

interface Parcel {
  _id: string
  parcelNumber: number
}

export default function ParcelPage() {
  const router = useRouter()

  const [parcels, setParcels] = useState<Parcel[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  /* ================= FETCH ================= */

  const fetchParcels = async () => {
    try {
      const res = await fetch('/api/counter/parcel', {
        cache: 'no-store',
        credentials: 'include',
      })

      if (!res.ok) return

      const data = await res.json()

      /* 🔥 avoid unnecessary re-render */
      setParcels(prev => {
        const same =
          prev.length === data.length &&
          prev.every((p, i) => p._id === data[i]._id)

        return same ? prev : data
      })

    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  /* ================= POLLING ================= */

  useEffect(() => {
    fetchParcels()

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchParcels()
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  /* ================= OPEN ================= */

  const openParcel = (id: string) => {
    if (processing) return
    router.push(`/counter/orders/${id}`)
  }

  /* ================= CREATE ================= */

  const createParcel = async () => {
    if (processing) return

    setProcessing(true)

    try {
      const res = await fetch('/api/counter/parcel/create', {
        method: 'POST',
        credentials: 'include',
      })

      if (!res.ok) return

      const data = await res.json()

      router.push(`/counter/orders/${data._id}`)

    } catch (err) {
      console.error(err)
    } finally {
      setTimeout(() => setProcessing(false), 800)
    }
  }

  /* ================= UI ================= */

  if (loading) {
    return <div className="p-6 text-gray-500">Loading parcels...</div>
  }

  return (
    <div className="p-4 md:p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">

        <h1 className="text-xl md:text-2xl font-bold">
          Parcel Orders
        </h1>

        <div className="flex gap-3">

          <Button
            onClick={createParcel}
            disabled={processing}
            className="bg-green-600 text-white"
          >
            {processing ? 'Creating...' : '+ New Parcel'}
          </Button>

          <Button
            onClick={() => router.push('/counter/tables')}
            className="bg-black text-white"
          >
            Go To Tables
          </Button>

        </div>

      </div>

      {/* GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">

        {parcels.map(parcel => (
          <Card
            key={parcel._id}
            onClick={() => openParcel(parcel._id)}
            className="p-5 cursor-pointer text-center bg-yellow-50 border-yellow-300 hover:shadow-lg active:scale-95"
          >
            <h2 className="text-lg font-bold">
              Parcel #{parcel.parcelNumber}
            </h2>
          </Card>
        ))}

      </div>

    </div>
  )
}