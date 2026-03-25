/* =========================
2) ADMIN ORDER DETAIL PAGE
========================= */
'use client';

import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/app/components/ui/card';

interface Item {
  _id: string;
  nameSnapshot: string;
  priceSnapshot: number;
  quantity: number;
  served?: boolean;
  cancelled?: boolean;
  wasted?: boolean;
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
        const res = await fetch(`/api/admin/orders/${orderId}`, {
          cache: 'no-store',
          credentials: 'include',
        });
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

  const statusMeta = useMemo(() => {
    if (!order) {
      return {
        label: '-',
        className: 'border-[#3b2a1a]/20 text-gray-600 bg-transparent',
      };
    }

    if (order.closedReason === 'completed') {
      return {
        label: 'Completed',
        className: 'border-green-700 text-green-700 bg-transparent',
      };
    }

    if (order.closedReason === 'cancelled') {
      return {
        label: 'Cancelled',
        className: 'border-red-700 text-red-700 bg-transparent',
      };
    }

    if (order.closedReason === 'force_closed') {
      return {
        label: 'Waste',
        className: 'border-orange-700 text-orange-700 bg-transparent',
      };
    }

    return {
      label: 'Running',
      className: 'border-blue-700 text-blue-700 bg-transparent',
    };
  }, [order]);

  const duration = useMemo(() => {
    if (!order?.closedAt) return 0;

    return Math.floor(
      (new Date(order.closedAt).getTime() -
        new Date(order.openedAt).getTime()) /
        60000,
    );
  }, [order]);

  if (loading) {
    return <div className="p-6 text-gray-500">Loading order...</div>;
  }

  if (!order) {
    return <div className="p-6 text-red-500">Order not found</div>;
  }

  return (
    <div className="px-3 py-4 sm:px-4 md:px-6 md:py-6">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* HEADER */}
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Order Detail</h1>
            <p className="text-sm text-gray-500 mt-1">
              Full order summary, items, wastage, and payment breakdown.
            </p>
          </div>

          <span
            className={`text-sm px-3 py-1.5 rounded-md border self-start ${statusMeta.className}`}
          >
            {statusMeta.label}
          </span>
        </div>

        {/* TOP INFO */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card
            variant="ghost"
            hover={false}
            className="p-4 border border-[#3b2a1a]/15 bg-transparent shadow-none"
          >
            <p className="text-xs text-gray-500">Order</p>
            <p className="text-xl font-bold mt-1">
              {order.tableNumber != null
                ? `Table ${order.tableNumber}`
                : order.parcelNumber != null
                  ? `Parcel #${order.parcelNumber}`
                  : '-'}
            </p>
          </Card>

          <Card
            variant="ghost"
            hover={false}
            className="p-4 border border-[#3b2a1a]/15 bg-transparent shadow-none"
          >
            <p className="text-xs text-gray-500">Bill Number</p>
            <p className="text-xl font-bold mt-1">{order.billNumber || '-'}</p>
          </Card>

          <Card
            variant="ghost"
            hover={false}
            className="p-4 border border-[#3b2a1a]/15 bg-transparent shadow-none"
          >
            <p className="text-xs text-gray-500">Duration</p>
            <p className="text-xl font-bold mt-1">{duration} min</p>
          </Card>
        </div>

        {/* ORDER INFO */}
        <Card
          variant="ghost"
          hover={false}
          className="p-5 border border-[#3b2a1a]/15 bg-transparent shadow-none"
        >
          <h2 className="text-lg font-bold mb-4">Order Info</h2>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 text-sm">
            <div className="flex justify-between gap-3">
              <span className="text-gray-500">Opened</span>
              <span className="font-medium">
                {new Date(order.openedAt).toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between gap-3">
              <span className="text-gray-500">Closed</span>
              <span className="font-medium">
                {order.closedAt
                  ? new Date(order.closedAt).toLocaleString()
                  : '-'}
              </span>
            </div>

            <div className="flex justify-between gap-3">
              <span className="text-gray-500">Order Status</span>
              <span className="font-medium capitalize">{order.status}</span>
            </div>

            <div className="flex justify-between gap-3">
              <span className="text-gray-500">Closed Reason</span>
              <span className="font-medium capitalize">
                {order.closedReason
                  ? order.closedReason.replace('_', ' ')
                  : '-'}
              </span>
            </div>
          </div>
        </Card>

        {/* ITEMS + SUMMARY */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1.3fr_0.7fr]">
          <Card
            variant="ghost"
            hover={false}
            className="p-5 border border-[#3b2a1a]/15 bg-transparent shadow-none"
          >
            <h2 className="text-lg font-bold mb-4">Items</h2>

            <div className="space-y-3">
              {order.items.map((item) => {
                let label = '';
                let className = '';

                if (item.served) {
                  label = 'Served';
                  className = 'border-green-700 text-green-700';
                } else if (item.wasted) {
                  label = 'Wasted';
                  className = 'border-orange-700 text-orange-700';
                } else if (item.cancelled) {
                  label = 'Cancelled';
                  className = 'border-red-700 text-red-700';
                }

                return (
                  <div
                    key={item._id}
                    className="flex items-start justify-between gap-3 border-b border-[#3b2a1a]/10 pb-3 last:border-b-0 last:pb-0"
                  >
                    <div>
                      <p className="font-medium">
                        {item.nameSnapshot} × {item.quantity}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        ₹{item.priceSnapshot} each
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold">
                        ₹{item.priceSnapshot * item.quantity}
                      </p>

                      {label ? (
                        <span
                          className={`inline-block mt-2 text-xs px-2 py-1 rounded-md border bg-transparent ${className}`}
                        >
                          {label}
                        </span>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card
            variant="ghost"
            hover={false}
            className="p-5 border border-[#3b2a1a]/15 bg-transparent shadow-none"
          >
            <h2 className="text-lg font-bold mb-4">Summary</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Total</span>
                <span className="font-medium">
                  ₹{order.summary?.total || 0}
                </span>
              </div>

              <div className="flex justify-between text-green-700">
                <span>Served (Revenue)</span>
                <span className="font-medium">
                  ₹{order.summary?.servedTotal || 0}
                </span>
              </div>

              <div className="flex justify-between text-red-700">
                <span>Cancelled</span>
                <span className="font-medium">
                  ₹{order.summary?.cancelledTotal || 0}
                </span>
              </div>

              <div className="flex justify-between text-orange-700">
                <span>Wastage</span>
                <span className="font-medium">
                  ₹{order.summary?.wastedTotal || 0}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* PAYMENT */}
        <Card
          variant="ghost"
          hover={false}
          className="p-5 border border-[#3b2a1a]/15 bg-transparent shadow-none"
        >
          <h2 className="text-lg font-bold mb-4">Payment</h2>

          {order.payments.length === 0 ? (
            <p className="text-sm text-gray-500">No payment found.</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {order.payments.map((p, i) => (
                <Card
                  key={i}
                  variant="ghost"
                  hover={false}
                  className="p-4 border border-[#3b2a1a]/10 bg-transparent shadow-none"
                >
                  <p className="text-xs text-gray-500">Method</p>
                  <p className="text-lg font-bold mt-1 uppercase">{p.method}</p>

                  <p className="text-xs text-gray-500 mt-3">Amount</p>
                  <p className="text-lg font-semibold mt-1">₹{p.amount}</p>
                </Card>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
