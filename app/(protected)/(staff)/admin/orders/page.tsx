'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card } from '@/app/components/ui/card';

interface Order {
  _id: string;
  status: string;
  table?: {
    tableNumber: number;
  };

  billNumber?: number;
  totalAmount: number;

  openedAt: string;
  closedAt?: string;

  isPaid?: boolean;
}

export default function AdminOrdersPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const status = searchParams.get('status');

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  /* ---------------- FETCH ---------------- */

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const url = status
          ? `/api/admin/orders?status=${status}`
          : `/api/admin/orders`;

        const res = await fetch(url, { cache: 'no-store' });

        const data = await res.json();

        setOrders(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [status]);

  /* ---------------- UI ---------------- */

  if (loading)
    return <div className="p-6 text-gray-500">Loading orders...</div>;

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold capitalize">
        {status || 'All'} Orders
      </h1>

      {orders.length === 0 && (
        <p className="text-red-500 text-center py-10">No orders found</p>
      )}

      <div className="space-y-3">
        {orders.map((order) => (
          <Card
            key={order._id}
            className="p-4 cursor-pointer hover:shadow-md transition"
            onClick={() => router.push(`/admin/orders/${order._id}`)}
          >
            <div className="flex justify-between">
              <div className="space-y-1">
               

                <p className="font-bold">
                  Table {order.table?.tableNumber || '-'}
                </p>
                <p className="text-sm">Bill #{order.billNumber || '-'}</p>

                <p className="text-xs">
                  Closed:{' '}
                  {order.closedAt
                    ? new Date(order.closedAt).toLocaleString()
                    : '-'}
                </p>
              </div>

              <div className="text-right space-y-1">
                <p className="font-bold text-lg">₹{order.totalAmount}</p>

                <p className="text-sm">{order.isPaid ? 'Paid' : 'Cancelled'}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
