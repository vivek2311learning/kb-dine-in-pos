'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/app/components/ui/button';

interface Item {
  _id: string;
  nameSnapshot: string;
  quantity: number;
  kitchenStatus: string;
  served?: boolean;
  cancelled?: boolean;
  wasted?: boolean;

  tableId: {
    _id: string;
    tableNumber: number;
  };
}

export default function KitchenPage() {

  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  /* ---------------- FETCH ITEMS ---------------- */

  const fetchItems = async () => {

    try {

      const res = await fetch('/api/kitchen/orders', {
        cache: 'no-store'
      });

      if (!res.ok) return;

      const data = await res.json();

      const visibleItems = data.filter(
        (i: Item) =>
          !i.cancelled &&
          !i.wasted &&
          i.kitchenStatus?.toLowerCase() !== 'draft' &&
          i.kitchenStatus?.toLowerCase() !== 'served'
      );

      /* READY ITEMS TOP */

      visibleItems.sort((a: Item, b: Item) => {

        if (a.kitchenStatus === 'ready') return -1;
        if (b.kitchenStatus === 'ready') return 1;

        return 0;

      });

      setItems(visibleItems);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }

  };

  useEffect(() => {

    fetchItems();

    const interval = setInterval(fetchItems, 3000);

    return () => clearInterval(interval);

  }, []);

  /* ---------------- STATUS UPDATE ---------------- */

  const updateStatus = async (id: string, currentStatus: string) => {

    const status = currentStatus?.toLowerCase();

    let nextStatus = '';

    if (status === 'pending') nextStatus = 'preparing';
    else if (status === 'preparing') nextStatus = 'ready';
    else return;

    /* optimistic update */

    setItems(prev =>
      prev.map(item =>
        item._id === id
          ? { ...item, kitchenStatus: nextStatus }
          : item
      )
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

  /* ---------------- STATUS COLOR ---------------- */

  const statusColor = (status: string) => {

    const s = status?.toLowerCase();

    switch (s) {

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

  /* ---------------- BUTTON LABEL ---------------- */

  const buttonLabel = (status: string) => {

    const s = status?.toLowerCase();

    if (s === 'pending') return 'Start';
    if (s === 'preparing') return 'Ready';

    return null;

  };

  /* ---------------- UI ---------------- */

  if (loading) {
    return (
      <div className="p-6 text-gray-500">
        Loading kitchen orders...
      </div>
    );
  }

  return (

    <div className="p-4 md:p-6 max-w-6xl mx-auto">

      <h1 className="text-2xl font-bold mb-6">
        Kitchen Orders
      </h1>

      {items.length === 0 && (
        <p className="text-gray-400">
          No active kitchen items
        </p>
      )}

      {/* GRID */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

        {items.map(item => {

          const label = buttonLabel(item.kitchenStatus);

          return (

            <div
              key={item._id}
              className={`
                border rounded-xl p-4 shadow-sm flex flex-col gap-3
                ${item.kitchenStatus === 'ready'
                  ? 'border-green-500 bg-green-50'
                  : ''}
              `}
            >

              {/* HEADER */}

              <div className="flex justify-between items-center">

                <span className="font-bold text-lg">
                  Table {item.tableId?.tableNumber}
                </span>

                <span
                  className={`
                    text-white text-xs px-3 py-1 rounded-full
                    ${statusColor(item.kitchenStatus)}
                  `}
                >
                  {item.kitchenStatus}
                </span>

              </div>

              {/* ITEM */}

              <div>

                <p className="font-medium text-lg">
                  {item.nameSnapshot}
                </p>

                <p className="text-sm text-gray-500">
                  Quantity: {item.quantity}
                </p>

              </div>

              {/* ACTION */}

              {label && (

                <Button
                  onClick={() =>
                    updateStatus(item._id, item.kitchenStatus)
                  }
                  className="bg-black text-white"
                >
                  {label}
                </Button>

              )}

            </div>

          );

        })}

      </div>

    </div>

  );

}