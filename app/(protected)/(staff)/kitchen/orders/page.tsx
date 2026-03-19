'use client';

import { useEffect, useState } from 'react';

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
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  /* ---------- FETCH ---------- */

  const fetchItems = async () => {
    if (fetching) return;
    setFetching(true);

    try {
      const res = await fetch('/api/kitchen/orders', {
        cache: 'no-store',
        credentials: 'include',
      });

      if (!res.ok) return;

      const data: Item[] = await res.json();

      const grouped: Record<string, Item[]> = {};

      data.forEach((item) => {
        if (!grouped[item.tableLabel]) grouped[item.tableLabel] = [];
        grouped[item.tableLabel].push(item);
      });

      const newOrders = Object.entries(grouped).map(([label, items]) => ({
        label,
        items,
      }));

      /* 🔥 avoid unnecessary re-render */
      setOrders((prev) => {
        const same =
          prev.length === newOrders.length &&
          prev.every(
            (p, i) =>
              p.label === newOrders[i].label &&
              p.items.length === newOrders[i].items.length
          );

        return same ? prev : newOrders;
      });

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setFetching(false);
    }
  };

  /* ---------- POLLING (OPTIMIZED) ---------- */

  useEffect(() => {
    fetchItems();

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchItems();
      }
    }, 4000); // ✅ reduced load

    return () => clearInterval(interval);
  }, []);

  /* ---------- UPDATE ---------- */

  const updateStatus = async (id: string, status: string) => {
    if (updatingId === id) return;

    let next = '';

    if (status === 'pending') next = 'preparing';
    else if (status === 'preparing') next = 'ready';
    else return;

    setUpdatingId(id);

    /* 🔥 optimistic update */
    setOrders((prev) =>
      prev.map((o) => ({
        ...o,
        items: o.items.map((i) =>
          i._id === id ? { ...i, kitchenStatus: next } : i,
        ),
      })),
    );

    try {
      const res = await fetch(`/api/kitchen/order-items/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
        credentials: 'include',
      });

      if (!res.ok) {
        /* ❌ rollback if failed */
        fetchItems();
      }

    } catch (err) {
      console.error(err);
      fetchItems(); // rollback
    } finally {
      setTimeout(() => setUpdatingId(null), 500);
    }
  };

  /* ---------- UI ---------- */

  if (loading) {
    return <div className="p-6 text-gray-500">Loading kitchen...</div>;
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🔥 Kitchen Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {orders.map((order) => (
          <div
            key={order.label}
            className="rounded-2xl p-4 shadow-md bg-white border flex flex-col gap-4"
          >
            <div className="text-lg font-bold border-b pb-2">
              {order.label}
            </div>

            <div className="flex flex-col gap-3">
              {order.items.map((item) => (
                <div
                  key={item._id}
                  className="flex justify-between items-center border-b pb-2"
                >
                  <div>
                    <p className="font-medium">{item.nameSnapshot}</p>
                    <p className="text-xs text-gray-500">
                      Qty: {item.quantity}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1">

                    {item.kitchenStatus !== 'ready' ? (
                      <button
                        disabled={updatingId === item._id}
                        onClick={() =>
                          updateStatus(item._id, item.kitchenStatus)
                        }
                        className={`
                          text-xs px-3 py-1 rounded text-white
                          ${
                            item.kitchenStatus === 'pending'
                              ? 'bg-yellow-500'
                              : ''
                          }
                          ${
                            item.kitchenStatus === 'preparing'
                              ? 'bg-blue-600'
                              : ''
                          }
                          ${
                            updatingId === item._id
                              ? 'opacity-50 cursor-not-allowed'
                              : ''
                          }
                        `}
                      >
                        {item.kitchenStatus === 'pending' &&
                          'status : Pending • Start Cooking'}
                        {item.kitchenStatus === 'preparing' &&
                          'status : Preparing • Item Ready'}
                      </button>
                    ) : (
                      <span className="text-xs px-3 py-1 rounded bg-green-600 text-white">
                        Ready to Serve
                      </span>
                    )}

                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}