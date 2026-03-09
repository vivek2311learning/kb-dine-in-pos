'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card } from '@/app/components/ui/card';

interface Order {
  _id: string;
  status: string;
  table: {
    tableNumber: number;
  };
  totalAmount: number;
  openedAt: string;
}

export default function AdminOrdersPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const status = searchParams.get('status');

  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      const res = await fetch(`/api/admin/orders?status=${status}`);
      const data = await res.json();
      setOrders(data);
    };

    fetchOrders();
  }, [status]);

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold capitalize">{status} Orders</h1>

      {orders.map((order) => (
        <Card
          key={order._id}
          className="p-4 cursor-pointer hover:shadow-md"
          onClick={() => router.push(`/admin/orders/${order._id}`)}
        >
          <div className="flex justify-between">
            <div>
              <p>Table {order.table?.tableNumber}</p>
              <p className="text-sm text-gray-500">{order.status}</p>
            </div>
            <div className="font-semibold">₹{order.totalAmount}</div>
          </div>
        </Card>
      ))}
    </div>
  );
}
