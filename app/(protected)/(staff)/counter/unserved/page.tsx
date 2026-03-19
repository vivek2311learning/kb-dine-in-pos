'use client';

import { useEffect, useState } from 'react';

interface Item {
  _id: string;
  nameSnapshot: string;
  quantity: number;
  kitchenStatus: string;
  tableLabel: string;
}

interface Group {
  label: string;
  items: Item[];
}

export default function UnservedPage() {
  const [orders, setOrders] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/counter/unserved', {
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

      setOrders(
        Object.entries(grouped).map(([label, items]) => ({
          label,
          items,
        })),
      );

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();

    const interval = setInterval(fetchItems, 3000); // light polling

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="p-6 text-gray-500">Loading...</div>;
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        Unserved Items (Counter View)
      </h1>

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
                  className="flex justify-between border-b pb-2"
                >
                  <div>
                    <p className="font-medium">{item.nameSnapshot}</p>
                    <p className="text-xs text-gray-500">
                      Qty: {item.quantity}
                    </p>
                  </div>

                  <span
                    className={`
                      text-xs px-2 py-1 rounded text-white
                      ${item.kitchenStatus === 'pending' && 'bg-yellow-500'}
                      ${item.kitchenStatus === 'preparing' && 'bg-blue-600'}
                      ${item.kitchenStatus === 'ready' && 'bg-green-600'}
                    `}
                  >
                    {item.kitchenStatus}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}

      </div>
    </div>
  );
}