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

  // 🔹 Fetch Table Details
  const fetchTable = async () => {
    const res = await fetch(`/api/tables/${tableId}`);
    const data = await res.json();
    setTable(data);
    setLoading(false);
  };

  useEffect(() => {
    if (tableId) fetchTable();
  }, [tableId]);

  // 🔹 Open Order
  const handleOpenOrder = async () => {
    if (!table) return;

    // If already occupied → go to order
    if (table.status === 'occupied' && table.currentOrderId) {
      router.push(
        `/counter/tables/${tableId}/order?orderId=${table.currentOrderId}`,
      );
      return;
    }

    // If free → create new order
    const res = await fetch('/api/counter/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tableId }),
    });

    const newOrder = await res.json();

    router.push(`/counter/tables/${tableId}/order?orderId=${newOrder._id}`);
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!table) {
    return (
      <div className="p-6">
        <p>Table not found</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <Card className="p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Table {table.tableNumber}</h1>

          <Badge>{table.status === 'free' ? 'Free' : 'Occupied'}</Badge>
        </div>

        <Button onClick={handleOpenOrder} className="w-full">
          {table.status === 'free' ? 'Start New Order' : 'View Current Order'}
        </Button>
      </Card>
    </div>
  );
}
