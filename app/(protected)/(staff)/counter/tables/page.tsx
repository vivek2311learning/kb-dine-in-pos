'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';

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

  const [processing, setProcessing] = useState(false);

  /* ================= FETCH TABLES ================= */

  const fetchTables = async () => {
    try {
      const res = await fetch('/api/counter/tables');

      if (!res.ok) throw new Error('Failed to fetch tables');

      const data = await res.json();

      setTables(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();

    const interval = setInterval(fetchTables, 5000);

    return () => clearInterval(interval);
  }, []);

  /* ================= TABLE CLICK ================= */

  const handleClick = async (table: Table) => {
    if (processing) return;

    setProcessing(true);

    try {
      /* -------- FREE TABLE -------- */

      if (table.status === 'free') {
        const res = await fetch('/api/counter/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tableId: table._id }),
        });

        if (!res.ok) {
          const text = await res.text();
          console.error('Order creation error:', text);
          return;
        }

        const order = await res.json();

        await fetchTables();

        router.push(
          `/counter/tables/${table._id}/order?orderId=${order._id}`
        );

        return;
      }

      /* -------- OCCUPIED TABLE -------- */

      if (table.currentOrderId) {
        router.push(
          `/counter/tables/${table._id}/order?orderId=${table.currentOrderId}`
        );
      }
    } finally {
      setProcessing(false);
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

  if (!tables.length) {
    return (
      <div className="p-6 text-center text-gray-500">
        No tables found
      </div>
    );
  }

  return (
    <div className="p-6">

      <h1 className="text-2xl font-bold mb-6">
        Tables Overview
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

        {tables.map((table) => (

          <Card
            key={table._id}
            onClick={() => handleClick(table)}
            className={`
              p-6
              cursor-pointer
              transition
              hover:shadow-lg
              text-center
              ${
                table.status === 'free'
                  ? 'bg-green-50 border-green-300'
                  : 'bg-red-50 border-red-300'
              }
            `}
          >

            <h2 className="text-xl font-bold mb-2">
              Table {table.tableNumber}
            </h2>

            <Badge>
              {table.status === 'free' ? 'Free' : 'Occupied'}
            </Badge>

          </Card>

        ))}

      </div>

    </div>
  );
}