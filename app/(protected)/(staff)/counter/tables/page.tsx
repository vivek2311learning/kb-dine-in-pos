'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';

interface Table {
  _id: string;
  tableNumber: number;
  status: 'free' | 'occupied';
  currentOrderId?: string;
}

export default function TablesPage() {
  const router = useRouter();

  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  /* ================= FETCH ================= */

  const fetchTables = async () => {
    try {
      const res = await fetch('/api/counter/tables', {
        cache: 'no-store',
        credentials: 'include',
      });

      if (!res.ok) return;

      const data = await res.json();

      /* 🔥 SMART UPDATE (NO UNNECESSARY RERENDER) */
      setTables((prev) => {
        const same =
          prev.length === data.length &&
          prev.every(
            (t, i) =>
              t._id === data[i]._id &&
              t.status === data[i].status &&
              t.currentOrderId === data[i].currentOrderId
          );

        return same ? prev : data;
      });

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= POLLING ================= */

  useEffect(() => {
    fetchTables();

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchTables();
      }
    }, 5000); // ✅ optimized polling

    return () => clearInterval(interval);
  }, []);

  /* ================= CLICK ================= */

  const handleClick = async (table: Table) => {
    /* 🔥 SAME TABLE DOUBLE CLICK BLOCK */
    if (processingId === table._id) return;

    setProcessingId(table._id);

    try {
      /* 🚀 FREE → CREATE ORDER */
      if (table.status === 'free') {
        const res = await fetch('/api/counter/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tableId: table._id }),
          credentials: 'include',
        });

        if (!res.ok) return;

        const data = await res.json();
        const orderId = data._id || data.order?._id;

        router.push(`/counter/orders/${orderId}`);
        return;
      }

      /* 🚀 OCCUPIED → OPEN */
      if (table.currentOrderId) {
        router.push(`/counter/orders/${table.currentOrderId}`);
      }

    } catch (err) {
      console.error(err);
    } finally {
      /* 🔥 DELAY RESET (PREVENT DOUBLE CLICK BUG) */
      setTimeout(() => setProcessingId(null), 800);
    }
  };

  /* ================= UI ================= */

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Loading tables...
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl md:text-2xl font-bold">Tables</h1>

        <Button
          onClick={() => router.push('/counter/parcel')}
          className="bg-black text-white"
        >
          Parcel Order
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">

        {tables.map((table) => {
          const isProcessing = processingId === table._id;

          return (
            <Card
              key={table._id}
              onClick={() => handleClick(table)}
              className={`
                p-5 text-center transition active:scale-95
                ${
                  isProcessing
                    ? 'opacity-50 pointer-events-none'
                    : 'cursor-pointer hover:shadow-lg'
                }
                ${
                  table.status === 'free'
                    ? 'bg-green-50 border-green-300'
                    : 'bg-red-50 border-red-300'
                }
              `}
            >
              <h2 className="text-lg font-bold mb-2">
                Table {table.tableNumber}
              </h2>

              <Badge>
                {table.status === 'free' ? 'Free' : 'Occupied'}
              </Badge>
            </Card>
          );
        })}

      </div>

    </div>
  );
}