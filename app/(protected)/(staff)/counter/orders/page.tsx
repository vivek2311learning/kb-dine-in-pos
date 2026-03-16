'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';

import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
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

  const { show } = useNotification();

  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  const fetchOrder = async () => {
    if (!orderId) return;

    const res = await fetch(`/api/counter/orders/${orderId}`, {
      cache: 'no-store',
    });

    const data = await res.json();

    const visible = (data.items || []).filter((i: OrderItem) => !i.cancelled);

    setOrderItems(visible);
  };

  const fetchMenu = async () => {
    const res = await fetch('/api/menu', { cache: 'no-store' });
    const data = await res.json();

    setMenuItems(data);

    if (data.length && !category) {
      setCategory(data[0].category);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  useEffect(() => {
    if (!orderId) return;

    fetchOrder();

    const interval = setInterval(fetchOrder, 5000);

    return () => clearInterval(interval);
  }, [orderId]);

  const addItem = async (item: MenuItem) => {
    if (!orderId) return;

    await fetch(`/api/counter/orders/${orderId}/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ menuItemId: item._id }),
    });

    fetchOrder();
  };

  const categories = [...new Set(menuItems.map((i) => i.category))];

  const filteredMenu = menuItems.filter(
    (i) =>
      i.category === category &&
      i.name.toLowerCase().includes(search.toLowerCase()),
  );

  const total = orderItems
    .filter((i) => i.kitchenStatus !== 'draft')
    .reduce((sum, i) => sum + i.priceSnapshot * i.quantity, 0);

  return (
    <div className="h-screen grid grid-cols-1 lg:grid-cols-2 gap-4 p-3 md:p-6">
      {/* MENU */}

      <div className="space-y-4 overflow-y-auto">
        <h2 className="text-xl font-bold">Menu</h2>

        <Input
          placeholder="Search item..."
          value={search}
          onChange={(e: any) => setSearch(e.target.value)}
        />

        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <Button
              key={cat}
              onClick={() => setCategory(cat)}
              className={
                category === cat ? 'bg-black text-white' : 'bg-gray-200'
              }
            >
              {cat}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {filteredMenu.map((item) => (
            <Card
              key={item._id}
              onClick={() => addItem(item)}
              className="p-4 cursor-pointer hover:shadow-lg active:scale-95"
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
        <h2 className="text-xl font-bold mb-4">Current Order</h2>

        <div className="flex-1 overflow-y-auto space-y-3">
          {orderItems.map((item) => (
            <Card key={item._id} className="p-3">
              <div className="flex justify-between">
                <div>
                  <p>{item.nameSnapshot}</p>
                  <p className="text-xs">{item.kitchenStatus}</p>
                </div>

                <span>x{item.quantity}</span>
              </div>
            </Card>
          ))}
        </div>

        <div className="border-t pt-4 mt-4 sticky bottom-0 bg-white">
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>₹{total}</span>
          </div>

          <Button
            className="w-full mt-4 bg-green-600"
            onClick={() =>
              router.push(`/counter/tables/${tableId}/bill/${orderId}`)
            }
          >
            View Bill
          </Button>
        </div>
      </div>
    </div>
  );
}
