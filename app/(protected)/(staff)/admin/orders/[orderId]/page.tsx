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
  wasted?: boolean; // 🔥 NEW
}

interface Payment {
  method: string;
  amount: number;
}

interface Order {
  _id: string;
  status: string;
  closedReason?: string;

  tableNumber?: number | null;
  parcelNumber?: number | null;

  openedAt: string;
  closedAt?: string;

  billNumber?: number;
  isPaid?: boolean;

  payments: Payment[];
  items: Item[];

  summary?: {
    total: number;
    servedTotal: number;
    cancelledTotal: number;
    wastedTotal: number;
  };
}

export default function AdminOrderDetailPage() {
  const params = useParams();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

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

  /* 🔥 STATUS UI */
  const getStatus = () => {
    if (order.closedReason === 'completed')
      return ['Completed', 'text-green-600'];
    if (order.closedReason === 'cancelled')
      return ['Cancelled', 'text-red-600'];
    if (order.closedReason === 'force_closed')
      return ['Waste', 'text-orange-600'];
    return ['Running', 'text-gray-500'];
  };

  const [statusLabel, statusColor] = getStatus();

  /* 🔥 DURATION */
  const duration = order.closedAt
    ? Math.floor(
        (new Date(order.closedAt).getTime() -
          new Date(order.openedAt).getTime()) /
          60000,
      )
    : 0;

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-3xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold">Order Detail</h1>

      {/* ORDER INFO */}
      <Card className="p-4 space-y-2 md:mx-24">
        <p className="text-lg font-semibold">
          {order.tableNumber != null
            ? `Table ${order.tableNumber}`
            : order.parcelNumber != null
              ? `Parcel #${order.parcelNumber}`
              : '-'}
        </p>

        <p>
          <strong>Bill #:</strong> {order.billNumber || '-'}
        </p>

        <p>
          <strong>Status:</strong>{' '}
          <span className={statusColor}>{statusLabel}</span>
        </p>

        <p className="text-sm">
          Opened: {new Date(order.openedAt).toLocaleString()}
        </p>

        {order.closedAt && (
          <p className="text-sm">
            Closed: {new Date(order.closedAt).toLocaleString()}
          </p>
        )}

        <p className="text-sm">Duration: {duration} min</p>
      </Card>

      {/* ITEMS */}
      <Card className="p-4 space-y-3 md:mx-24">
        <h2 className="font-semibold text-lg">Items</h2>

        {order.items.map((item) => {
          let label = '';
          let color = '';

          if (item.served) {
            label = 'Served';
            color = 'text-green-600';
          } else if (item.wasted) {
            label = 'Wasted';
            color = 'text-orange-600';
          } else if (item.cancelled) {
            label = 'Cancelled';
            color = 'text-red-600';
          }

          return (
            <div key={item._id} className="flex justify-between text-sm">
              <span>
                {item.nameSnapshot} × {item.quantity}
              </span>

              <span>
                ₹{item.priceSnapshot * item.quantity}
                {label && <span className={`ml-2 ${color}`}>{label}</span>}
              </span>
            </div>
          );
        })}
      </Card>

      {/* 🔥 SUMMARY (BIG FEATURE) */}
      <Card className="p-4 space-y-2 md:mx-24">
        <h2 className="font-semibold">Summary</h2>

        <div className="flex justify-between text-sm">
          <span>Total</span>
          <span>₹{order.summary?.total || 0}</span>
        </div>

        <div className="flex justify-between text-sm text-green-600">
          <span>Served (Revenue)</span>
          <span>₹{order.summary?.servedTotal || 0}</span>
        </div>

        <div className="flex justify-between text-sm text-red-600">
          <span>Cancelled</span>
          <span>₹{order.summary?.cancelledTotal || 0}</span>
        </div>

        <div className="flex justify-between text-sm text-orange-600">
          <span>Wastage</span>
          <span>₹{order.summary?.wastedTotal || 0}</span>
        </div>
      </Card>

      {/* PAYMENT */}
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
