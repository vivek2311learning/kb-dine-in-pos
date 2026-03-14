'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card } from '@/app/components/ui/card';

interface Item {
  _id: string;
  nameSnapshot: string;
  priceSnapshot: number;
  quantity: number;
  served?: boolean;
  cancelled?: boolean;
}

interface Payment {
  method: string;
  amount: number;
}

interface Order {
  _id: string;
  status: string;

  table: {
    tableNumber: number;
  };

  openedAt: string;
  closedAt?: string;

  billNumber?: number;
  isPaid?: boolean;

  payments: Payment[];

  items: Item[];
}

export default function AdminOrderDetailPage() {
  const params = useParams();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  /* ---------------- FETCH ORDER ---------------- */

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/admin/orders/${orderId}`);

        const data = await res.json();

        setOrder(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) fetchOrder();
  }, [orderId]);

  if (loading) return <div className="p-6 text-gray-500">Loading order...</div>;

  if (!order) return <div className="p-6 text-red-500">Order not found</div>;

  /* ---------------- TOTAL ---------------- */

  const total = order.items.reduce(
    (sum, item) => sum + item.priceSnapshot * item.quantity,
    0,
  );

  /* ---------------- DURATION ---------------- */

  const duration = order.closedAt
    ? Math.floor(
        (new Date(order.closedAt).getTime() -
          new Date(order.openedAt).getTime()) /
          60000,
      )
    : 0;

  /* ---------------- UI ---------------- */

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-3xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold">Order Detail</h1>

      {/* ORDER INFO */}

      <Card className="p-4 space-y-2 md:mx-24">
        <p>
          <strong>Table:</strong> {order.table?.tableNumber}
        </p>

        <p>
          <strong>Bill #:</strong> {order.billNumber || '-'}
        </p>

        <p>
          <strong>Status:</strong> {order.isPaid ? 'Paid' : 'Cancelled'}
        </p>

        <p className="text-sm">
          Opened: {new Date(order.openedAt).toLocaleString()}
        </p>

        {order.closedAt && (
          <p className="text-sm">
            Closed: {new Date(order.closedAt).toLocaleString()}
          </p>
        )}

        <p className="text-sm ">Duration: {duration} min</p>
      </Card>

      {/* ITEMS */}

      <Card className="p-4 space-y-3 md:mx-24">
        <h2 className="font-semibold text-lg">Items</h2>

        {order.items.map((item) => (
          <div key={item._id} className="flex justify-between text-sm">
            <span>
              {item.nameSnapshot} × {item.quantity}
            </span>

            <span>
              ₹{item.priceSnapshot * item.quantity}
              {item.served && (
                <span className="ml-2 text-green-600">Served</span>
              )}
              {!item.served && item.cancelled && (
                <span className="ml-2 text-red-600">Cancelled</span>
              )}
            </span>
          </div>
        ))}
      </Card>

      {/* TOTAL */}

      <Card className="p-4 flex justify-between font-semibold text-lg md:mx-24">
        <span>Total</span>
        <span>₹{total}</span>
      </Card>

      <Card className="p-4 space-y-2 md:mx-24">
        <h2 className="font-semibold">Payment</h2>

        {order.payments.length === 0 && (
          <p className="text-sm text-gray-500">No payment</p>
        )}

        {order.payments.map((p, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span>{p.method.toUpperCase()}</span>

            <span>₹{p.amount}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}
