'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/app/components/ui/button';

interface Item {
  _id: string;
  nameSnapshot: string;
  quantity: number;
  kitchenStatus: string;
  tableLabel: string;
}

interface OrderGroup {
  label: string;
  items: Item[];
}

export default function KitchenPage() {
  const [orders, setOrders] = useState<OrderGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);

  const fetchItems = async () => {
    if (fetching) return;
    setFetching(true);

    try {
      const res = await fetch('/api/kitchen/orders', {
        cache: 'no-store',
      });

      if (!res.ok) return;

      const data: Item[] = await res.json();

      /* ---------- GROUP BY TABLE / PARCEL ---------- */

      const grouped: Record<string, Item[]> = {};

      data.forEach((item) => {
        if (!grouped[item.tableLabel]) {
          grouped[item.tableLabel] = [];
        }

        grouped[item.tableLabel].push(item);
      });

      const result: OrderGroup[] = Object.entries(grouped).map(
        ([label, items]) => ({
          label,
          items,
        }),
      );

      setOrders(result);
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();

    const onFocus = () => fetchItems();

    window.addEventListener('focus', onFocus);

    return () => {
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  const updateStatus = async (id: string, currentStatus: string) => {
    const status = currentStatus.toLowerCase();

    let nextStatus = '';

    if (status === 'pending') nextStatus = 'preparing';
    else if (status === 'preparing') nextStatus = 'ready';
    else return;

    /* optimistic update */

    setOrders((prev) =>
      prev.map((order) => ({
        ...order,
        items: order.items.map((item) =>
          item._id === id ? { ...item, kitchenStatus: nextStatus } : item,
        ),
      })),
    );

    try {
      await fetch(`/api/kitchen/order-items/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const statusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-500';

      case 'preparing':
        return 'bg-blue-600';

      case 'ready':
        return 'bg-green-600';

      default:
        return 'bg-gray-400';
    }
  };

  const buttonLabel = (status: string) => {
    const s = status.toLowerCase();

    if (s === 'pending') return 'Start';
    if (s === 'preparing') return 'Ready';

    return null;
  };

  if (loading) {
    return <div className="p-6 text-gray-500">Loading kitchen orders...</div>;
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <h1 className="text-xl md:text-2xl font-bold mb-6">Kitchen Orders</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {orders.map((order) => {
          return (
            <div
              key={order.label}
              className="border rounded-xl p-4 shadow-sm flex flex-col gap-4 bg-white"
            >
              {/* HEADER */}

              <div className="font-bold text-lg border-b pb-2">
                {order.label}
              </div>

              {/* ITEMS */}

              {order.items.map((item) => {
                const label = buttonLabel(item.kitchenStatus);

                return (
                  <div
                    key={item._id}
                    className="flex flex-col gap-2 border-b pb-2"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{item.nameSnapshot}</span>

                      <span className="text-sm text-gray-500">
                        x{item.quantity}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span
                        className={`text-white text-xs px-3 py-1 rounded-full ${statusColor(item.kitchenStatus)}`}
                      >
                        {item.kitchenStatus}
                      </span>

                      {label && (
                        <Button
                          onClick={() =>
                            updateStatus(item._id, item.kitchenStatus)
                          }
                          className="bg-black text-white h-7 px-3 text-xs"
                        >
                          {label}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
