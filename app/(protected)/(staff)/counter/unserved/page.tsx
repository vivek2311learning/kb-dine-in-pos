'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';

interface Item {
  _id: string;
  nameSnapshot: string;
  quantity: number;
  kitchenStatus: 'pending' | 'preparing' | 'ready' | string;
  tableLabel: string;
}

interface Group {
  label: string;
  items: Item[];
}

export default function UnservedPage() {
  const [orders, setOrders] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const buildGroups = (data: Item[]) => {
    const grouped: Record<string, Item[]> = {};

    data.forEach((item) => {
      if (!grouped[item.tableLabel]) grouped[item.tableLabel] = [];
      grouped[item.tableLabel].push(item);
    });

    return Object.entries(grouped).map(([label, items]) => ({
      label,
      items,
    }));
  };

  const fetchItems = useCallback(async (showLoader = false) => {
    try {
      if (showLoader) {
        setLoading(true);
      }

      setError('');

      const res = await fetch('/api/counter/unserved', {
        cache: 'no-store',
        credentials: 'include',
      });

      const data = await res.json().catch(() => []);

      if (!res.ok) {
        setError(data?.error || 'Failed to load unserved items');
        return;
      }

      const grouped = buildGroups(data);

      setOrders((prev) => {
        const same =
          prev.length === grouped.length &&
          prev.every((group, groupIndex) => {
            const nextGroup = grouped[groupIndex];

            return (
              group.label === nextGroup.label &&
              group.items.length === nextGroup.items.length &&
              group.items.every((item, itemIndex) => {
                const nextItem = nextGroup.items[itemIndex];

                return (
                  item._id === nextItem._id &&
                  item.quantity === nextItem.quantity &&
                  item.kitchenStatus === nextItem.kitchenStatus &&
                  item.tableLabel === nextItem.tableLabel
                );
              })
            );
          });

        return same ? prev : grouped;
      });
    } catch (err) {
      console.error(err);
      setError('Failed to load unserved items');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems(true);

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchItems(false);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [fetchItems]);

  const stats = useMemo(() => {
    const allItems = orders.flatMap((group) => group.items);

    return {
      groups: orders.length,
      items: allItems.length,
      ready: allItems.filter((item) => item.kitchenStatus === 'ready').length,
    };
  }, [orders]);

  const statusClass = (status: string) => {
    if (status === 'pending') {
      return 'border-yellow-600 text-yellow-700 bg-transparent';
    }

    if (status === 'preparing') {
      return 'border-blue-600 text-blue-700 bg-transparent';
    }

    if (status === 'ready') {
      return 'border-green-600 text-green-700 bg-transparent';
    }

    return 'border-[#3b2a1a]/20 text-[#3b2a1a] bg-transparent';
  };

  const statusLabel = (status: string) => {
    if (status === 'pending') return 'Pending';
    if (status === 'preparing') return 'Preparing';
    if (status === 'ready') return 'Ready';
    return status;
  };

  if (loading) {
    return (
      <div className="px-4 py-6 md:px-6">
        <div className="mx-auto max-w-7xl text-center text-gray-500">
          Loading unserved items...
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 py-4 sm:px-4 md:px-6 md:py-6">
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Unserved Items</h1>
            <p className="text-sm text-gray-500 mt-1">
              Live counter view for items that are pending, preparing, or ready.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          <Card
            variant="ghost"
            hover={false}
            className="p-3 md:p-4 text-center border border-[#3b2a1a]/15 bg-transparent shadow-none"
          >
            <p className="text-xs md:text-sm text-gray-500">Tables / Parcels</p>
            <p className="text-xl md:text-2xl font-bold mt-1">{stats.groups}</p>
          </Card>

          <Card
            variant="ghost"
            hover={false}
            className="p-3 md:p-4 text-center border border-[#3b2a1a]/15 bg-transparent shadow-none"
          >
            <p className="text-xs md:text-sm text-gray-500">Total Items</p>
            <p className="text-xl md:text-2xl font-bold mt-1">{stats.items}</p>
          </Card>

          <Card
            variant="ghost"
            hover={false}
            className="p-3 md:p-4 text-center border border-green-700/20 bg-transparent shadow-none"
          >
            <p className="text-xs md:text-sm text-gray-500">Ready Now</p>
            <p className="text-xl md:text-2xl font-bold mt-1">{stats.ready}</p>
          </Card>
        </div>

        {error ? (
          <Card
            variant="ghost"
            hover={false}
            className="p-6 text-center border border-red-200 bg-transparent shadow-none"
          >
            <p className="text-red-600 font-medium">{error}</p>
          </Card>
        ) : orders.length === 0 ? (
          <Card
            variant="ghost"
            hover={false}
            className="p-8 text-center border border-[#3b2a1a]/15 bg-transparent shadow-none"
          >
            <p className="text-gray-500">No unserved items right now.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {orders.map((order) => (
              <Card
                key={order.label}
                variant="ghost"
                hover={false}
                className="p-4 md:p-5 border border-[#3b2a1a]/15 bg-transparent shadow-none"
              >
                <div className="space-y-4">
                  <div className="border-b border-[#3b2a1a]/10 pb-3">
                    <h2 className="text-lg md:text-xl font-bold">
                      {order.label}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {order.items.length} item
                      {order.items.length > 1 ? 's' : ''}
                    </p>
                  </div>

                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <div
                        key={item._id}
                        className="rounded-xl border border-[#3b2a1a]/10 p-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-medium leading-tight">
                              {item.nameSnapshot}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Qty: {item.quantity}
                            </p>
                          </div>

                          <Badge
                            variant="outline"
                            className={`text-xs px-2 py-1 rounded-md ${statusClass(
                              item.kitchenStatus,
                            )}`}
                          >
                            {statusLabel(item.kitchenStatus)}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
