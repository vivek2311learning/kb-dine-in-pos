'use client';

import { useEffect, useMemo, useState } from 'react';

interface Item {
  _id: string;
  nameSnapshot: string;
  quantity: number;
  kitchenStatus: 'pending' | 'preparing' | 'ready';
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

  const buildGroups = (data: Item[]) => {
    const grouped: Record<string, Item[]> = {};

    data.forEach((item) => {
      if (!grouped[item.tableLabel]) {
        grouped[item.tableLabel] = [];
      }
      grouped[item.tableLabel].push(item);
    });

    return Object.entries(grouped).map(([label, items]) => ({
      label,
      items,
    }));
  };

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
      const newOrders = buildGroups(data);

      setOrders((prev) => {
        const same =
          prev.length === newOrders.length &&
          prev.every((prevGroup, groupIndex) => {
            const nextGroup = newOrders[groupIndex];

            if (!nextGroup) return false;
            if (prevGroup.label !== nextGroup.label) return false;
            if (prevGroup.items.length !== nextGroup.items.length) return false;

            return prevGroup.items.every((prevItem, itemIndex) => {
              const nextItem = nextGroup.items[itemIndex];
              if (!nextItem) return false;

              return (
                prevItem._id === nextItem._id &&
                prevItem.nameSnapshot === nextItem.nameSnapshot &&
                prevItem.quantity === nextItem.quantity &&
                prevItem.kitchenStatus === nextItem.kitchenStatus
              );
            });
          });

        return same ? prev : newOrders;
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchItems();

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchItems();
      }
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (id: string, status: Item['kitchenStatus']) => {
    if (updatingId === id) return;

    let next: Item['kitchenStatus'] | '' = '';

    if (status === 'pending') next = 'preparing';
    else if (status === 'preparing') next = 'ready';
    else return;

    setUpdatingId(id);

    setOrders((prev) =>
      prev.map((group) => ({
        ...group,
        items: group.items.map((item) =>
          item._id === id ? { ...item, kitchenStatus: next } : item,
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
        await fetchItems();
      }
    } catch (err) {
      console.error(err);
      await fetchItems();
    } finally {
      setTimeout(() => setUpdatingId(null), 400);
    }
  };

  const stats = useMemo(() => {
    const allItems = orders.flatMap((group) => group.items);

    return {
      totalGroups: orders.length,
      totalItems: allItems.length,
      pending: allItems.filter((item) => item.kitchenStatus === 'pending')
        .length,
      preparing: allItems.filter((item) => item.kitchenStatus === 'preparing')
        .length,
      ready: allItems.filter((item) => item.kitchenStatus === 'ready').length,
    };
  }, [orders]);

  const statusClass = (status: Item['kitchenStatus']) => {
    if (status === 'pending') {
      return 'border-yellow-700 text-yellow-800 bg-transparent';
    }

    if (status === 'preparing') {
      return 'border-blue-700 text-blue-700 bg-transparent';
    }

    return 'border-green-700 text-green-700 bg-transparent';
  };

  const actionLabel = (status: Item['kitchenStatus']) => {
    if (status === 'pending') return 'Start Cooking';
    if (status === 'preparing') return 'Mark Ready';
    return 'Ready';
  };

  const actionClass = (status: Item['kitchenStatus']) => {
    if (status === 'pending') {
      return 'border-yellow-700 text-yellow-800';
    }

    if (status === 'preparing') {
      return 'border-blue-700 text-blue-700';
    }

    return 'border-green-700 text-green-700';
  };

  if (loading) {
    return (
      <div className="px-4 py-6 md:px-6">
        <div className="mx-auto max-w-7xl text-center text-gray-500">
          Loading kitchen...
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 py-4 sm:px-4 md:px-6 md:py-6">
      <div className="mx-auto max-w-7xl space-y-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Kitchen Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage kitchen flow from pending to ready.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          <div className="rounded-2xl border border-[#3b2a1a]/15 bg-transparent p-3 md:p-4 text-center shadow-none">
            <p className="text-xs md:text-sm text-gray-500">Orders</p>
            <p className="text-xl md:text-2xl font-bold mt-1">
              {stats.totalGroups}
            </p>
          </div>

          <div className="rounded-2xl border border-[#3b2a1a]/15 bg-transparent p-3 md:p-4 text-center shadow-none">
            <p className="text-xs md:text-sm text-gray-500">Items</p>
            <p className="text-xl md:text-2xl font-bold mt-1">
              {stats.totalItems}
            </p>
          </div>

          <div className="rounded-2xl border border-yellow-700/20 bg-transparent p-3 md:p-4 text-center shadow-none">
            <p className="text-xs md:text-sm text-gray-500">Pending</p>
            <p className="text-xl md:text-2xl font-bold mt-1 text-yellow-800">
              {stats.pending}
            </p>
          </div>

          <div className="rounded-2xl border border-blue-700/20 bg-transparent p-3 md:p-4 text-center shadow-none">
            <p className="text-xs md:text-sm text-gray-500">Preparing</p>
            <p className="text-xl md:text-2xl font-bold mt-1 text-blue-700">
              {stats.preparing}
            </p>
          </div>

          <div className="rounded-2xl border border-green-700/20 bg-transparent p-3 md:p-4 text-center shadow-none">
            <p className="text-xs md:text-sm text-gray-500">Ready</p>
            <p className="text-xl md:text-2xl font-bold mt-1 text-green-700">
              {stats.ready}
            </p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-2xl border border-[#3b2a1a]/15 bg-transparent p-8 text-center shadow-none">
            <p className="text-gray-500">No kitchen items right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {orders.map((order) => {
              const pendingCount = order.items.filter(
                (item) => item.kitchenStatus === 'pending',
              ).length;
              const preparingCount = order.items.filter(
                (item) => item.kitchenStatus === 'preparing',
              ).length;
              const readyCount = order.items.filter(
                (item) => item.kitchenStatus === 'ready',
              ).length;

              return (
                <div
                  key={order.label}
                  className="rounded-2xl border border-[#3b2a1a]/15 bg-transparent p-4 md:p-5 shadow-none"
                >
                  <div className="mb-4 border-b border-[#3b2a1a]/10 pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-lg md:text-xl font-bold">
                          {order.label}
                        </h2>
                        <p className="text-xs text-gray-500 mt-1">
                          {order.items.length} item
                          {order.items.length > 1 ? 's' : ''}
                        </p>
                      </div>

                      <div className="text-right text-xs text-gray-500 space-y-1">
                        <p>P: {pendingCount}</p>
                        <p>Prep: {preparingCount}</p>
                        <p>R: {readyCount}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {order.items.map((item) => {
                      const busy = updatingId === item._id;
                      const isReady = item.kitchenStatus === 'ready';

                      return (
                        <div
                          key={item._id}
                          className={`rounded-xl border p-3 ${
                            isReady
                              ? 'border-green-700/20 bg-transparent'
                              : 'border-[#3b2a1a]/10 bg-transparent'
                          } ${busy ? 'opacity-60 pointer-events-none' : ''}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="font-semibold leading-tight">
                                {item.nameSnapshot}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                Qty: {item.quantity}
                              </p>
                            </div>

                            <span
                              className={`rounded-md border px-2 py-1 text-xs ${statusClass(
                                item.kitchenStatus,
                              )}`}
                            >
                              {item.kitchenStatus}
                            </span>
                          </div>

                          <div className="mt-3">
                            {isReady ? (
                              <div className="w-full rounded-lg border border-green-700 text-green-700 text-sm font-medium text-center px-3 py-2">
                                Ready to Serve
                              </div>
                            ) : (
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() =>
                                  updateStatus(item._id, item.kitchenStatus)
                                }
                                className={`w-full rounded-lg border px-3 py-2 text-sm font-medium transition ${actionClass(
                                  item.kitchenStatus,
                                )} ${busy ? 'opacity-60 cursor-not-allowed' : ''}`}
                              >
                                {busy
                                  ? 'Updating...'
                                  : actionLabel(item.kitchenStatus)}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
