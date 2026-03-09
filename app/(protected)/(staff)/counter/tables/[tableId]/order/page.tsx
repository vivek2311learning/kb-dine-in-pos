'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
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

export default function OrderPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const tableId = params.tableId as string;
  const orderId = searchParams.get('orderId');

  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  const { show } = useNotification();

  /* ---------------- FETCH ORDER ---------------- */

  const fetchOrder = async () => {
    if (!orderId) return;

    const res = await fetch(`/api/counter/orders/${orderId}`);
    if (!res.ok) return;

    const data = await res.json();
    setOrderItems(data.items || []);
  };

  /* ---------------- FETCH MENU ---------------- */

  const fetchMenu = async () => {
    const res = await fetch('/api/menu');
    if (!res.ok) return;

    const data = await res.json();
    setMenuItems(data);

    if (data.length && !category) {
      setCategory(data[0].category);
    }
  };

  useEffect(() => {
    if (orderId) fetchOrder();
    fetchMenu();
  }, [orderId]);

  /* ---------------- ADD ITEM ---------------- */

  const addItem = async (item: MenuItem) => {
    if (!orderId) return;

    await fetch(`/api/counter/orders/${orderId}/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ menuItemId: item._id }),
    });

    fetchOrder();
  };

  /* ---------------- UPDATE QTY ---------------- */

  const updateQuantity = async (itemId: string, qty: number) => {
    if (!orderId) return;

    await fetch(`/api/counter/orders/${orderId}/items/${itemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: qty }),
    });

    fetchOrder();
  };

  /* ---------------- CONFIRM ITEM ---------------- */

  const confirmItem = async (itemId: string) => {
    if (!orderId) return;

    await fetch(`/api/counter/orders/${orderId}/items/${itemId}/confirm`, {
      method: 'PATCH',
    });

    fetchOrder();
  };

  /* ---------------- CANCEL ITEM  ---------------- */

  const cancelItem = async (itemId: string) => {
    if (!orderId) return;

    const confirmCancel = window.confirm(
      'Are you sure you want to cancel this item?',
    );

    if (!confirmCancel) return;

    await fetch(`/api/counter/orders/${orderId}/items/${itemId}/cancel`, {
      method: 'PATCH',
    });

    fetchOrder();
  };

  /* ---------------- MARK SERVED ---------------- */

  const markServed = async (itemId: string) => {
    await fetch(`/api/counter/order-items/${itemId}/serve`, {
      method: 'PATCH',
    });

    fetchOrder();
  };

  /* ---------------- BILL NAVIGATION ---------------- */

  const goToBill = () => {
    if (!orderId) return;

    const servedItems = orderItems.filter(
      (item) => item.served && !item.cancelled,
    );

    if (servedItems.length === 0) {
      show('error', 'No served items available for billing.');
      return;
    }

    router.push(`/counter/tables/${tableId}/bill/${orderId}`);
  };

  /* ---------------- FILTER ---------------- */

  const categories = [...new Set(menuItems.map((i) => i.category))];

  const filteredMenu = menuItems.filter(
    (i) =>
      i.category === category &&
      i.name.toLowerCase().includes(search.toLowerCase()),
  );

  const total = orderItems
    .filter((i) => !i.cancelled && i.kitchenStatus !== 'draft')
    .reduce((sum, item) => sum + item.priceSnapshot * item.quantity, 0);

  /* ---------------- ABANDON ORDER ---------------- */

  const handleAbandon = async () => {
    if (!orderId) return;

    const confirmClose = window.confirm(
      'No items ordered. Do you want to free this table?',
    );

    if (!confirmClose) return;

    await fetch(`/api/counter/orders/${orderId}/abandon`, { method: 'PATCH' });

    router.push('/counter/tables');
  };

  const hasConfirmedItems = orderItems.some(
    (item) => item.kitchenStatus !== 'draft' && !item.cancelled,
  );

  /* ---------------- UI ---------------- */

  return (
    <div className="h-screen p-6 grid grid-cols-2 gap-6">
      {/* LEFT MENU */}
      <div className="w-full space-y-4 overflow-y-auto">
        <h2 className="text-2xl font-bold">Menu</h2>

        <div className="flex gap-4">
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
        </div>

        <div className="grid gap-4">
          {filteredMenu.map((item) => (
            <Card
              key={item._id}
              onClick={() => addItem(item)}
              className="p-4 cursor-pointer hover:shadow-lg transition"
            >
              <div className="flex justify-between">
                <span>{item.name}</span>
                <span>₹{item.price}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* RIGHT ORDER */}
      <div className="border rounded-xl p-4 flex flex-col">
        <h2 className="text-2xl font-bold mb-4">Current Order</h2>

        <div className="flex-1 overflow-y-auto space-y-3">
          {orderItems
            .filter((item) => !item.cancelled)
            .map((item) => (
              <Card key={item._id} className="p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{item.nameSnapshot}</p>

                    {item.kitchenStatus !== 'draft' && (
                      <p className="text-sm text-gray-500">
                        Status: {item.kitchenStatus}
                      </p>
                    )}
                  </div>

                  {item.kitchenStatus === 'draft' ? (
                    <div className="flex items-center gap-2">
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

                      <Button
                        className="bg-blue-600"
                        onClick={() => confirmItem(item._id)}
                      >
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
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">x{item.quantity}</span>

                      {!item.served && item.kitchenStatus === 'ready' && (
                        <Button
                          className="bg-green-600"
                          onClick={() => markServed(item._id)}
                        >
                          Served
                        </Button>
                      )}

                      {item.kitchenStatus !== 'served' && (
                        <Button
                          className="bg-red-600"
                          onClick={() => cancelItem(item._id)}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            ))}

          {orderItems.length === 0 && (
            <p className="text-center">No items added</p>
          )}
        </div>

        {/* TOTAL */}
        <div className="mt-4 border-t pt-4">
          {/* TOTAL */}
          <div className="mt-4 border-t pt-4">
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>₹{total}</span>
            </div>

            <Button className="w-full mt-4 bg-green-600" onClick={goToBill}>
              View Bill
            </Button>

            {/* 🔥 ABANDON BUTTON */}
            {!hasConfirmedItems && (
              <Button
                className="w-full mt-3 bg-red-600"
                onClick={handleAbandon}
              >
                Free Table
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
