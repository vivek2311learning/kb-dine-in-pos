'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Select } from '@/app/components/ui/select';
import { useNotification } from '@/app/components/notification/provider';

interface OrderItem {
  _id: string;
  nameSnapshot: string;
  priceSnapshot: number;
  quantity: number;
  kitchenStatus: string;
  served: boolean;
  cancelled?: boolean;
}

interface MenuItem {
  _id: string;
  name: string;
  price: number;
  category: string;
}

interface Order {
  _id: string;
  parcelNumber?: number;
}

export default function ParcelOrderPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const orderId = searchParams.get('orderId');

  const { show } = useNotification();

  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [adding, setAdding] = useState(false);

  /* ---------------- FETCH ORDER ---------------- */

  const fetchOrder = async () => {
    if (!orderId) return;

    try {
      const res = await fetch('/api/counter/orders/${orderId}', {
        cache: 'no-store',
      });

      if (!res.ok) return;

      const data = await res.json();

      setOrder(data.order);

      const visible = (data.items || []).filter((i: OrderItem) => !i.cancelled);

      setOrderItems(visible);
    } catch (err) {
      console.error(err);
    }
  };

  /* ---------------- FETCH MENU ---------------- */

  const fetchMenu = async () => {
    try {
      const res = await fetch('/api/menu', { cache: 'no-store' });

      if (!res.ok) return;

      const data = await res.json();

      setMenuItems(data);

      if (data.length && !category) {
        setCategory(data[0].category);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  useEffect(() => {
    if (!orderId) {
      router.push('/counter/tables');
      return;
    }

    fetchOrder();
  }, [orderId]);

  /* ---------------- ADD ITEM ---------------- */

  const addItem = async (item: MenuItem) => {
    if (!orderId || adding) return;

    try {
      setAdding(true);

      await fetch('/api/counter/orders/${orderId}/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ menuItemId: item._id }),
      });

      fetchOrder();
    } catch (err) {
      console.error(err);
    } finally {
      setAdding(false);
    }
  };

  /* ---------------- UPDATE QTY ---------------- */

  const updateQuantity = async (itemId: string, qty: number) => {
    if (!orderId) return;

    if (qty <= 0) {
      await fetch('/api/counter/orders/${orderId}/items/${itemId}', {
        method: 'DELETE',
      });
      fetchOrder();
      return;
    }

    await fetch('/api/counter/orders/${orderId}/items/${itemId}', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: qty }),
    });

    fetchOrder();
  };

  /* ---------------- CONFIRM ---------------- */

  const confirmItem = async (itemId: string) => {
    if (!orderId) return;

    await fetch('/api/counter/orders/${orderId}/items/${itemId}/confirm', {
      method: 'PATCH',
    });

    fetchOrder();
  };

  /* ---------------- CANCEL ---------------- */

  const cancelItem = async (itemId: string) => {
    if (!orderId) return;

    const ok = window.confirm('Cancel this item?');
    if (!ok) return;

    await fetch('/api/counter/orders/${orderId}/items/${itemId}/cancel', {
      method: 'PATCH',
    });

    fetchOrder();
  };

  /* ---------------- SERVED ---------------- */

  const markServed = async (itemId: string) => {
    await fetch('/api/counter/order-items/${itemId}/serve', {
      method: 'PATCH',
    });

    fetchOrder();
  };

  /* ---------------- BILL ---------------- */

  const goToBill = () => {
    if (!orderId) return;

    router.push('/counter/bill/${orderId}');
  };

  /* ---------------- FILTER ---------------- */

  const categories = [...new Set(menuItems.map((i) => i.category))];

  const filteredMenu = menuItems.filter(
    (i) =>
      i.category === category &&
      i.name.toLowerCase().includes(search.toLowerCase()),
  );

  const total = orderItems
    .filter((i) => i.kitchenStatus !== 'draft')
    .reduce((sum, i) => sum + i.priceSnapshot * i.quantity, 0);

  /* ---------------- UI ---------------- */

  return (
    <div className="h-screen p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* MENU */}

      <div className="space-y-4 overflow-y-auto">
        {' '}
        <h2 className="text-xl font-bold">Parcel Menu</h2>{' '}
        <div className="flex gap-3">
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e: any) => setSearch(e.target.value)}
          />

          <Select
            value={category}
            onChange={(e: any) => setCategory(e.target.value)}
          >
            {categories.map((cat) => (
              <option key={cat}>{cat}</option>
            ))}
          </Select>
        </div>{' '}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredMenu.map((item) => (
            <Card
              key={item._id}
              onClick={() => addItem(item)}
              className="p-4 cursor-pointer hover:shadow-lg"
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

      <div className="border rounded-xl p-4 flex flex-col">
        {' '}
        <h2 className="text-xl font-bold mb-4">
          {order?.parcelNumber
            ? `Parcel #${order.parcelNumber}`
            : 'Parcel Order'}
        </h2>{' '}
        <div className="flex-1 space-y-3 overflow-y-auto">
          {orderItems.map((item) => (
            <Card key={item._id} className="p-3">
              <div className="flex justify-between items-center">
                <div>
                  <p>{item.nameSnapshot}</p>
                  <p className="text-xs">{item.kitchenStatus}</p>
                </div>

                {item.kitchenStatus === 'draft' ? (
                  <div className="flex gap-2">
                    <Button
                      onClick={() =>
                        updateQuantity(item._id, item.quantity - 1)
                      }
                    >
                      -
                    </Button>

                    <span>{item.quantity}</span>

                    <Button
                      onClick={() =>
                        updateQuantity(item._id, item.quantity + 1)
                      }
                    >
                      +
                    </Button>

                    <Button onClick={() => confirmItem(item._id)}>
                      Confirm
                    </Button>

                    <Button
                      className="bg-red-600"
                      onClick={() => cancelItem(item._id)}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <span>x{item.quantity}</span>

                    {!item.served && (
                      <Button onClick={() => cancelItem(item._id)}>
                        Cancel
                      </Button>
                    )}

                    {!item.served && item.kitchenStatus === 'ready' && (
                      <Button
                        className="bg-green-600"
                        onClick={() => markServed(item._id)}
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
        {/* TOTAL */}
        <div className="border-t pt-4 mt-4">
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>₹{total}</span>
          </div>

          <Button className="w-full mt-4 bg-green-600" onClick={goToBill}>
            View Bill
          </Button>
        </div>
      </div>
    </div>
  );
}
