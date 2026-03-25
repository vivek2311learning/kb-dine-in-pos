'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { useNotification } from '@/app/components/notification';

interface MenuItem {
  _id: string;
  name: string;
  price: number;
  category: string;
}

interface OrderItem {
  _id: string;
  nameSnapshot: string;
  priceSnapshot: number;
  quantity: number;
  kitchenStatus:
    | 'draft'
    | 'pending'
    | 'confirmed'
    | 'preparing'
    | 'ready'
    | 'served';
  served: boolean;
  cancelled?: boolean;
  wasted?: boolean;
}

interface Order {
  _id: string;
  type: 'dine-in' | 'parcel';
  status?: 'running' | 'billed' | 'paid' | 'closed';
  parcelNumber?: number;
  tableId?: { tableNumber: number } | null;
}

export default function OrderPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const router = useRouter();
  const notification = useNotification();

  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [pageLoading, setPageLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeItemId, setActiveItemId] = useState<string | null>(null);

  const loadOrder = useCallback(
    async (showLoader = false) => {
      try {
        if (showLoader) {
          setPageLoading(true);
        }

        setError('');

        const res = await fetch(`/api/counter/orders/${orderId}`, {
          cache: 'no-store',
          credentials: 'include',
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          setError(data?.error || 'Failed to load order');
          setOrder(null);
          setItems([]);
          return;
        }

        const visible = (data.items || []).filter(
          (i: OrderItem) => !i.cancelled,
        );

        setItems((prev) => {
          const same =
            prev.length === visible.length &&
            prev.every(
              (p, i) =>
                p._id === visible[i]._id &&
                p.quantity === visible[i].quantity &&
                p.kitchenStatus === visible[i].kitchenStatus &&
                p.served === visible[i].served,
            );

          return same ? prev : visible;
        });

        setOrder(data.order);
      } catch (err) {
        console.error(err);
        setError('Failed to load order');
      } finally {
        setPageLoading(false);
      }
    },
    [orderId],
  );

  const loadMenu = useCallback(async () => {
    try {
      const res = await fetch('/api/menu', {
        credentials: 'include',
        cache: 'no-store',
      });

      const data = await res.json().catch(() => []);

      if (!res.ok) {
        return;
      }

      setMenu(data);

      if (data.length && !category) {
        setCategory(data[0].category);
      }
    } catch (err) {
      console.error(err);
    }
  }, [category]);

  useEffect(() => {
    loadOrder(true);
    loadMenu();
  }, [loadOrder, loadMenu]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible' && !actionLoading) {
        loadOrder(false);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [loadOrder, actionLoading]);

  const runAction = async (
    fn: () => Promise<Response>,
    options?: {
      itemId?: string;
      successMessage?: string;
      silentSuccess?: boolean;
    },
  ) => {
    if (actionLoading) return false;

    setActionLoading(true);
    setActiveItemId(options?.itemId || null);

    try {
      const res = await fn();
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        notification.error(data?.error || 'Action failed');
        return false;
      }

      await loadOrder(false);

      if (options?.successMessage && !options.silentSuccess) {
        notification.success(options.successMessage);
      }

      return true;
    } catch (err) {
      console.error(err);
      notification.error('Something went wrong');
      return false;
    } finally {
      setActionLoading(false);
      setActiveItemId(null);
    }
  };

  const addItem = async (m: MenuItem) => {
    await runAction(
      () =>
        fetch(`/api/counter/orders/${orderId}/add`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ menuItemId: m._id }),
          credentials: 'include',
        }),
      {
        silentSuccess: true,
      },
    );
  };

  const updateQty = async (id: string, qty: number) => {
    await runAction(
      () =>
        fetch(`/api/counter/orders/${orderId}/items/${id}/update`, {
          method: qty <= 0 ? 'DELETE' : 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quantity: qty }),
          credentials: 'include',
        }),
      {
        itemId: id,
        silentSuccess: true,
      },
    );
  };

  const confirmItem = async (id: string) => {
    await runAction(
      () =>
        fetch(`/api/counter/orders/${orderId}/items/${id}/confirm`, {
          method: 'PATCH',
          credentials: 'include',
        }),
      {
        itemId: id,
        successMessage: 'Item sent to kitchen',
      },
    );
  };

  const cancelItem = async (id: string) => {
    await runAction(
      () =>
        fetch(`/api/counter/orders/${orderId}/items/${id}/cancel`, {
          method: 'PATCH',
          credentials: 'include',
        }),
      {
        itemId: id,
        successMessage: 'Item cancelled',
      },
    );
  };

  const serveItem = async (id: string) => {
    await runAction(
      () =>
        fetch(`/api/counter/orders/${orderId}/items/${id}/serve`, {
          method: 'PATCH',
          credentials: 'include',
        }),
      {
        itemId: id,
        successMessage: 'Item marked as served',
      },
    );
  };

  const cancelOrder = async () => {
    if (actionLoading) return;

    const proceed = window.confirm(
      'Cancel this order? If kitchen progress exists, it will be force closed.',
    );

    if (!proceed) return;

    setActionLoading(true);

    try {
      const res = await fetch(`/api/counter/orders/${orderId}/cancel`, {
        method: 'PATCH',
        credentials: 'include',
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        notification.error(data?.error || 'Failed to cancel order');
        return;
      }

      router.replace(
        order?.type === 'parcel' ? '/counter/parcel' : '/counter/tables',
      );
    } catch (err) {
      console.error(err);
      notification.error('Something went wrong while cancelling order');
    } finally {
      setActionLoading(false);
    }
  };

  const categories = useMemo(
    () => [...new Set(menu.map((i) => i.category))],
    [menu],
  );

  const filteredMenu = useMemo(() => {
    return menu.filter((i) => {
      if (search.trim()) {
        return i.name.toLowerCase().includes(search.toLowerCase());
      }

      if (category) {
        return i.category === category;
      }

      return true;
    });
  }, [menu, category, search]);

  const total = useMemo(() => {
    return items
      .filter((i) => i.kitchenStatus !== 'draft')
      .reduce((sum, i) => sum + i.priceSnapshot * i.quantity, 0);
  }, [items]);

  const hasServedItems = items.some((i) => i.served === true);
  const draftCount = items.filter((i) => i.kitchenStatus === 'draft').length;
  const readyCount = items.filter(
    (i) => i.kitchenStatus === 'ready' && !i.served,
  ).length;

  const label =
    order?.type === 'parcel'
      ? `Parcel #${order?.parcelNumber ?? '-'}`
      : `Table ${order?.tableId?.tableNumber ?? '-'}`;

  const statusLabel = (status: OrderItem['kitchenStatus'], served: boolean) => {
    if (served || status === 'served') return 'Served';
    if (status === 'draft') return 'Draft';
    if (status === 'pending') return 'Pending';
    if (status === 'confirmed') return 'Confirmed';
    if (status === 'preparing') return 'Preparing';
    if (status === 'ready') return 'Ready';
    return status;
  };

  const statusClass = (status: OrderItem['kitchenStatus'], served: boolean) => {
    if (served || status === 'served') {
      return 'border-green-700 text-green-700 bg-transparent';
    }

    if (status === 'draft') {
      return 'border-gray-500 text-gray-700 bg-transparent';
    }

    if (
      status === 'pending' ||
      status === 'confirmed' ||
      status === 'preparing'
    ) {
      return 'border-yellow-700 text-yellow-800 bg-transparent';
    }

    if (status === 'ready') {
      return 'border-blue-700 text-blue-700 bg-transparent';
    }

    return 'border-[#3b2a1a]/30 text-[#3b2a1a] bg-transparent';
  };

  if (pageLoading) {
    return (
      <div className="px-4 py-6 md:px-6">
        <div className="mx-auto max-w-7xl text-center text-gray-500">
          Loading order...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-6 md:px-6">
        <div className="mx-auto max-w-4xl">
          <Card
            variant="ghost"
            hover={false}
            className="p-6 text-center border border-red-200 bg-transparent shadow-none"
          >
            <p className="text-red-600 font-medium">{error}</p>

            <Button
              type="button"
              variant="outline"
              className="mt-4"
              onClick={() => loadOrder(true)}
            >
              Retry
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="px-4 py-6 md:px-6">
        <div className="mx-auto max-w-4xl">
          <Card
            variant="ghost"
            hover={false}
            className="p-6 text-center border border-[#3b2a1a]/15 bg-transparent shadow-none"
          >
            <p className="text-gray-500">Order not found.</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 py-3 sm:px-4 md:px-6 md:py-5">
      <div className="mx-auto max-w-7xl space-y-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{label}</h1>
            <p className="text-sm text-gray-500 mt-1">
              Add items, confirm for kitchen, serve ready items, and continue
              billing.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Card
              variant="ghost"
              hover={false}
              className="px-3 py-2 border border-[#3b2a1a]/15 bg-transparent shadow-none"
            >
              <p className="text-xs text-gray-500">Draft</p>
              <p className="font-bold">{draftCount}</p>
            </Card>

            <Card
              variant="ghost"
              hover={false}
              className="px-3 py-2 border border-[#3b2a1a]/15 bg-transparent shadow-none"
            >
              <p className="text-xs text-gray-500">Ready</p>
              <p className="font-bold">{readyCount}</p>
            </Card>

            <Card
              variant="ghost"
              hover={false}
              className="px-3 py-2 border border-[#3b2a1a]/15 bg-transparent shadow-none"
            >
              <p className="text-xs text-gray-500">Total</p>
              <p className="font-bold">₹{total}</p>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          {/* MENU PANEL */}
          <Card
            variant="ghost"
            hover={false}
            className="p-4 md:p-5 border border-[#3b2a1a]/15 bg-transparent shadow-none"
          >
            <div className="space-y-4">
              <div>
                <h2 className="text-lg md:text-xl font-bold">Menu</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Search items or select a category to add quickly.
                </p>
              </div>

              <Input
                placeholder="Search item..."
                value={search}
                onChange={(e: any) => setSearch(e.target.value)}
              />

              <div className="flex flex-wrap gap-2">
                {categories.map((c) => (
                  <Button
                    key={c}
                    type="button"
                    size="sm"
                    variant={category === c ? 'primary' : 'ghost'}
                    className={
                      category === c
                        ? ''
                        : 'bg-transparent border border-[#3b2a1a]/20 text-[#3b2a1a]'
                    }
                    onClick={() => setCategory(c)}
                  >
                    {c}
                  </Button>
                ))}
              </div>

              {filteredMenu.length === 0 ? (
                <Card
                  variant="ghost"
                  hover={false}
                  className="p-6 text-center border border-[#3b2a1a]/10 bg-transparent shadow-none"
                >
                  <p className="text-gray-500">No menu items found.</p>
                </Card>
              ) : (
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 2xl:grid-cols-4">
                  {filteredMenu.map((item) => (
                    <Card
                      key={item._id}
                      hover={false}
                      onClick={() => addItem(item)}
                      className={`
                        p-3 md:p-4
                        border border-[#3b2a1a]/15
                        bg-transparent
                        transition-all duration-200
                        ${
                          actionLoading
                            ? 'opacity-70 pointer-events-none'
                            : 'cursor-pointer hover:shadow-lg hover:-translate-y-1'
                        }
                      `}
                    >
                      <div className="space-y-2">
                        <p className="font-semibold leading-tight line-clamp-2">
                          {item.name}
                        </p>

                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm text-gray-600">
                            ₹{item.price}
                          </span>

                          <Badge
                            variant="outline"
                            className="text-[11px] px-2 py-1 bg-transparent"
                          >
                            {item.category}
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* ORDER PANEL */}
          <Card
            variant="ghost"
            hover={false}
            className="p-4 md:p-5 border border-[#3b2a1a]/15 bg-transparent shadow-none"
          >
            <div className="flex h-full min-h-[420px] flex-col">
              <div className="mb-4">
                <h2 className="text-lg md:text-xl font-bold">Current Items</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Manage draft, kitchen, and served items.
                </p>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                {items.length === 0 ? (
                  <Card
                    variant="ghost"
                    hover={false}
                    className="p-6 text-center border border-[#3b2a1a]/10 bg-transparent shadow-none"
                  >
                    <p className="text-gray-500">No items added yet.</p>
                  </Card>
                ) : (
                  items.map((i) => {
                    const busy = actionLoading && activeItemId === i._id;
                    const isDraft = i.kitchenStatus === 'draft';
                    const canServe = !i.served && i.kitchenStatus === 'ready';
                    const canCancel = !i.served;

                    return (
                      <Card
                        key={i._id}
                        hover={false}
                        className={`
                          p-3 md:p-4
                          border border-[#3b2a1a]/12
                          bg-transparent
                          ${busy ? 'opacity-60 pointer-events-none' : ''}
                        `}
                      >
                        <div className="flex flex-col gap-3">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                              <p className="font-semibold leading-tight">
                                {i.nameSnapshot}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                ₹{i.priceSnapshot} × {i.quantity} = ₹
                                {i.priceSnapshot * i.quantity}
                              </p>
                            </div>

                            <Badge
                              variant="outline"
                              className={`text-xs px-2 py-1 rounded-md ${statusClass(
                                i.kitchenStatus,
                                i.served,
                              )}`}
                            >
                              {statusLabel(i.kitchenStatus, i.served)}
                            </Badge>
                          </div>

                          {isDraft ? (
                            <div className="flex flex-wrap items-center gap-2">
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => updateQty(i._id, i.quantity - 1)}
                              >
                                -
                              </Button>

                              <span className="min-w-8 text-center text-sm font-medium">
                                {i.quantity}
                              </span>

                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => updateQty(i._id, i.quantity + 1)}
                              >
                                +
                              </Button>

                              <Button
                                type="button"
                                size="sm"
                                onClick={() => confirmItem(i._id)}
                              >
                                Confirm
                              </Button>

                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="border-red-500 text-red-700"
                                onClick={() => cancelItem(i._id)}
                              >
                                Remove
                              </Button>
                            </div>
                          ) : (
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-medium">
                                Qty: {i.quantity}
                              </span>

                              {canCancel && (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  className="border-red-500 text-red-700"
                                  onClick={() => cancelItem(i._id)}
                                >
                                  Cancel
                                </Button>
                              )}

                              {canServe && (
                                <Button
                                  type="button"
                                  size="sm"
                                  onClick={() => serveItem(i._id)}
                                >
                                  Mark Served
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      </Card>
                    );
                  })
                )}
              </div>

              <div className="mt-4 border-t border-[#3b2a1a]/10 pt-4 space-y-3">
                <div className="flex items-center justify-between text-base font-bold">
                  <span>Total</span>
                  <span>₹{total}</span>
                </div>

                <Button
                  type="button"
                  disabled={!hasServedItems || actionLoading}
                  className={`w-full ${
                    !hasServedItems ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  onClick={() => {
                    if (!hasServedItems) {
                      notification.warning(
                        'Serve at least one item before billing',
                      );
                      return;
                    }

                    router.push(`/counter/bill/${orderId}`);
                  }}
                >
                  View Bill
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-yellow-700 text-yellow-800"
                  disabled={actionLoading}
                  onClick={cancelOrder}
                >
                  Cancel Order
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
