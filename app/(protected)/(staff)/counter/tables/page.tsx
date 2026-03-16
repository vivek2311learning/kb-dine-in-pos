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
  const [processing, setProcessing] = useState(false);
  const [fetching, setFetching] = useState(false);

  /* ---------------- FETCH TABLES ---------------- */

  const fetchTables = async () => {
    if (fetching) return;
    setFetching(true);

    try {
      const res = await fetch('/api/counter/tables');

      if (!res.ok) throw new Error('Failed to fetch tables');

      const data = await res.json();

      setTables(data);
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();

    const onFocus = () => fetchTables();

    window.addEventListener('focus', onFocus);

    return () => {
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  /* ---------------- TABLE CLICK ---------------- */

  const handleClick = async (table: Table) => {
    if (processing) return;
    setProcessing(true);

    try {
      if (table.status === 'free') {
        const res = await fetch('/api/counter/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tableId: table._id }),
        });

        if (!res.ok) return;

        const data = await res.json();

        const orderId = data.order?._id || data._id;

        router.push(`/counter/tables/${table._id}/order?orderId=${orderId}`);

        return;
      }

      if (table.currentOrderId) {
        router.push(
          `/counter/tables/${table._id}/order?orderId=${table.currentOrderId}`,
        );
      }
    } finally {
      setProcessing(false);
    }
  };

  /* ---------------- UI ---------------- */

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">Loading tables...</div>
    );
  }

  if (!tables.length) {
    return <div className="p-6 text-center text-gray-500">No tables found</div>;
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl md:text-2xl font-bold">Tables</h1>

        <Button
          onClick={() => router.push('/counter/parcel')}
          className="bg-black text-white"
        >
          + Parcel Order
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {tables.map((table) => (
          <Card
            key={table._id}
            onClick={() => handleClick(table)}
            className={`
          p-5
          cursor-pointer
          text-center
          transition
          hover:shadow-lg
          active:scale-95
          ${
            table.status === 'free'
              ? 'bg-green-50 border-green-300'
              : 'bg-red-50 border-red-300'
          }
        `}
          >
            <h2 className="text-lg md:text-xl font-bold mb-2">
              Table {table.tableNumber}
            </h2>

            <Badge>{table.status === 'free' ? 'Free' : 'Occupied'}</Badge>
          </Card>
        ))}
      </div>
    </div>
  );
}
