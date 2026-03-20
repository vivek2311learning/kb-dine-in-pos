'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';

export default function OrderPage() {
  const { orderId } = useParams();
  const router = useRouter();

  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [menu, setMenu] = useState<any[]>([]);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  const [loading, setLoading] = useState(false);

  /* ================= LOAD ================= */

  const loadOrder = async () => {
    try {
      const res = await fetch(`/api/counter/orders/${orderId}`, {
        cache: 'no-store',
        credentials: 'include',
      });

      if (!res.ok) return;

      const data = await res.json();

      const visible = (data.items || []).filter((i: any) => !i.cancelled);

      /* 🔥 avoid unnecessary rerender */
      setItems((prev) => {
        const same =
          prev.length === visible.length &&
          prev.every(
            (p, i) =>
              p._id === visible[i]._id &&
              p.quantity === visible[i].quantity &&
              p.kitchenStatus === visible[i].kitchenStatus,
          );

        return same ? prev : visible;
      });

      setOrder(data.order);
    } catch (err) {
      console.error(err);
    }
  };

  const loadMenu = async () => {
    try {
      const res = await fetch('/api/menu', {
        credentials: 'include',
      });

      if (!res.ok) return;

      const data = await res.json();

      setMenu(data);

      if (data.length && !category) {
        setCategory(data[0].category);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadOrder();
    loadMenu();
  }, []);

  /* ================= ACTION WRAPPER ================= */

  const run = async (fn: any) => {
    if (loading) return;

    setLoading(true);

    try {
      await fn();
      await loadOrder();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= ACTIONS ================= */

  const addItem = (m: any) =>
    run(() =>
      fetch(`/api/counter/orders/${orderId}/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ menuItemId: m._id }),
      }),
    );

  const updateQty = (id: string, qty: number) =>
    run(() =>
      fetch(`/api/counter/orders/${orderId}/items/${id}/update`, {
        method: qty <= 0 ? 'DELETE' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: qty }),
      }),
    );

  const confirmItem = (id: string) =>
    run(() =>
      fetch(`/api/counter/orders/${orderId}/items/${id}/confirm`, {
        method: 'PATCH',
      }),
    );

  const cancelItem = (id: string) =>
    run(() =>
      fetch(`/api/counter/orders/${orderId}/items/${id}/cancel`, {
        method: 'PATCH',
      }),
    );

  const serveItem = (id: string) =>
    run(async () => {
      const res = await fetch(
        `/api/counter/orders/${orderId}/items/${id}/serve`,
        {
          method: 'PATCH',
          credentials: 'include',
        },
      );

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Serve failed');
        throw new Error('Serve failed');
      }

      return res;
    });
  const hasServedItems = items.some((i) => i.served === true);

  const cancelOrder = async () => {
    if (loading) return;

    const confirmed = window.confirm(
      'Cancel this order? If kitchen progress exists, it will be force closed.',
    );

    if (!confirmed) return;

    setLoading(true);

    try {
      const resOrder = await fetch(`/api/counter/orders/${orderId}`, {
        cache: 'no-store',
        credentials: 'include',
      });

      const latest = await resOrder.json();

      if (!resOrder.ok) {
        alert(latest.error || 'Failed to load latest order');
        return;
      }

      const latestItems = latest.items || [];

      const hasKitchenProgress = latestItems.some(
        (item: any) =>
          !item.cancelled &&
          !item.wasted &&
          (item.served === true ||
            ['confirmed', 'pending', 'preparing', 'ready'].includes(
              item.kitchenStatus,
            )),
      );

      const url = hasKitchenProgress
        ? `/api/counter/orders/${orderId}/force-close`
        : `/api/counter/orders/${orderId}/cancel`;

      const res = await fetch(url, {
        method: 'PATCH',
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Action failed');
        return;
      }

      router.push(
        latest.order?.type === 'parcel' ? '/counter/parcel' : '/counter/tables',
      );
    } catch (err) {
      console.error(err);
      alert('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  /* ================= FILTER ================= */

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

  /* ================= TOTAL ================= */

  const total = useMemo(() => {
    return items
      .filter((i) => i.kitchenStatus !== 'draft')
      .reduce((sum, i) => sum + i.priceSnapshot * i.quantity, 0);
  }, [items]);

  const label =
    order?.type === 'parcel'
      ? `Parcel #${order?.parcelNumber ?? '-'}`
      : `Table ${order?.tableId?.tableNumber ?? '-'}`;

  /* ================= UI ================= */

  return (
    <div className="h-screen grid md:grid-cols-2 gap-4 p-4">
      {/* MENU */}
      <div className="flex flex-col h-full">
        <h2 className="text-xl font-bold mb-2">Menu</h2>

        <Input
          placeholder="Search item..."
          value={search}
          onChange={(e: any) => setSearch(e.target.value)}
        />

        <div className="flex gap-2 flex-wrap mt-2">
          {categories.map((c) => (
            <Button key={c} onClick={() => setCategory(c)}>
              {c}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 mt-3 overflow-y-auto flex-1">
          {filteredMenu.map((item) => (
            <Card
              key={item._id}
              onClick={() => addItem(item)}
              className="p-4 cursor-pointer"
            >
              <div className="flex justify-between">
                <span>{item.name}</span>
                <span>₹{item.price}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* ORDER */}
      <div className="flex flex-col border rounded-xl p-4 h-full">
        <h2 className="text-xl font-bold mb-3">{label}</h2>

        <div className="flex-1 overflow-y-auto space-y-3">
          {items.map((i) => (
            <Card key={i._id} className="p-3">
              <div className="flex justify-between items-center">
                <div>
                  <p>{i.nameSnapshot}</p>
                  <p className="text-sm ">{i.kitchenStatus}</p>
                </div>

                {i.kitchenStatus === 'draft' ? (
                  <div className="flex gap-2">
                    <Button onClick={() => updateQty(i._id, i.quantity - 1)}>
                      -
                    </Button>
                    <span className="p-2">{i.quantity}</span>
                    <Button onClick={() => updateQty(i._id, i.quantity + 1)}>
                      +
                    </Button>
                    <Button onClick={() => confirmItem(i._id)}>Confirm</Button>
                    <Button
                      className="bg-red-600"
                      onClick={() => cancelItem(i._id)}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <span>x{i.quantity}</span>

                    {!i.served && (
                      <Button onClick={() => cancelItem(i._id)}>Cancel</Button>
                    )}

                    {!i.served && i.kitchenStatus === 'ready' && (
                      <Button
                        className="bg-green-600"
                        onClick={() => serveItem(i._id)}
                      >
                        Served
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* FOOTER */}
        <div className="border-t pt-3 mt-3">
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>₹{total}</span>
          </div>

          <Button
            disabled={!hasServedItems}
            className={`w-full mt-3 ${
              hasServedItems ? 'bg-green-600' : 'bg-gray-300 cursor-not-allowed'
            }`}
            onClick={() => {
              if (!hasServedItems) return;
              router.push(`/counter/bill/${orderId}`);
            }}
          >
            View Bill
          </Button>

          <Button className="w-full mt-2 bg-yellow-600" onClick={cancelOrder}>
            Cancel Order
          </Button>
        </div>
      </div>
    </div>
  );
}
