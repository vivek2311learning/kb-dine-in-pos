'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';

interface Table {
  _id: string;
  tableNumber: number;
  status: 'free' | 'occupied';
  currentOrderId?: string;
}

export default function TablePage() {
  const params = useParams();
  const router = useRouter();

  const tableId = params.tableId as string;

  const [table, setTable] = useState<Table | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  /* ---------------- FETCH TABLE ---------------- */

  const fetchTable = async () => {
    try {
      const res = await fetch(`/api/tables/${tableId}`);

      if (!res.ok) throw new Error('Failed to fetch table');

      const data = await res.json();

      setTable(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tableId) fetchTable();
  }, [tableId]);

  /* ---------------- OPEN ORDER ---------------- */

  const handleOpenOrder = async () => {
    if (!table || processing) return;

    setProcessing(true);

    try {
      /* OCCUPIED TABLE */

      if (table.status === 'occupied' && table.currentOrderId) {
        router.push(
          `/counter/tables/${tableId}/order?orderId=${table.currentOrderId}`
        );
        return;
      }

      /* FREE TABLE → CREATE ORDER */

      const res = await fetch('/api/counter/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableId }),
      });

      if (!res.ok) throw new Error('Failed to create order');

      const newOrder = await res.json();

      router.push(
        `/counter/tables/${tableId}/order?orderId=${newOrder._id}`
      );

    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  /* ---------------- UI ---------------- */

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Loading table...
      </div>
    );
  }

  if (!table) {
    return (
      <div className="p-6 text-center text-gray-500">
        Table not found
      </div>
    );
  }

  return (
    <div className="p-6 max-w-xl mx-auto">

      <Card className="p-6 space-y-4">

        <div className="flex justify-between items-center">

          <h1 className="text-2xl font-bold">
            Table {table.tableNumber}
          </h1>

          <Badge>
            {table.status === 'free' ? 'Free' : 'Occupied'}
          </Badge>

        </div>

        <Button
          onClick={handleOpenOrder}
          disabled={processing}
          className="w-full"
        >
          {processing
            ? 'Opening...'
            : table.status === 'free'
            ? 'Start New Order'
            : 'View Current Order'}
        </Button>

      </Card>

    </div>
  );
}