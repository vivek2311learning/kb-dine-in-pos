'use client';

import { useEffect, useState } from 'react';

interface Item {
  _id: string;
  nameSnapshot: string;
  quantity: number;
  kitchenStatus: string;
  tableId: {
    _id: string;
    tableNumber: number;
  };
}

export default function CounterOrdersPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/kitchen/orders');
      if (!res.ok) return;

      const data = await res.json();

      // ✅ Hide draft & served
      const visibleItems = data.filter(
        (i: Item) =>
          i.kitchenStatus?.toLowerCase() !== 'draft' &&
          i.kitchenStatus?.toLowerCase() !== 'served',
      );

      setItems(visibleItems);
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchItems();
    const interval = setInterval(fetchItems, 3000);
    return () => clearInterval(interval);
  }, []);

  const statusColor = (status: string) => {
    const s = status?.toLowerCase();

    switch (s) {
      case 'pending':
        return 'bg-yellow-500';
      case 'preparing':
        return 'bg-blue-500';
      case 'ready':
        return 'bg-green-600';
      default:
        return 'bg-gray-400';
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Counter Orders</h1>

      {items.length === 0 && <p className="text-gray-500">No active items</p>}

      {items.map((item) => (
        <div key={item._id} className="border rounded p-4 mb-3">
          <p className="font-medium">Table: {item.tableId?.tableNumber}</p>

          <p>
            {item.nameSnapshot} × {item.quantity}
          </p>

          <span
            className={`text-white text-sm px-3 py-1 rounded ${statusColor(item.kitchenStatus)}`}
          >
            {item.kitchenStatus}
          </span>
        </div>
      ))}
    </div>
  );
}
