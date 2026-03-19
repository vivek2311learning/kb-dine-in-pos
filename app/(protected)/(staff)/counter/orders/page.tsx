'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Select } from '@/app/components/ui/select';

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
  kitchenStatus: string;
  served: boolean;
  cancelled?: boolean;
}

interface Order {
  _id: string;
  type: 'dine-in' | 'parcel';
  parcelNumber?: number;
  tableId?: { tableNumber: number };
}

export default function OrderPage() {
  const params = useParams();
  const router = useRouter();

  const orderId = params.orderId as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);

  /* ================= FETCH ORDER ================= */

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/counter/orders/${orderId}`, {
        cache: 'no-store',
        credentials: 'include',
      });

      if (!res.ok) return;

      const data = await res.json();

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
              p.kitchenStatus === visible[i].kitchenStatus,
          );

        return same ? prev : visible;
      });

      setOrder(data.order);

    } catch (err) {
      console.error(err);
    }
  };

  /* ================= FETCH MENU ================= */

  useEffect(() => {
    const load = async () => {
      const res = await fetch('/api/menu', { credentials: 'include' });
      const data = await res.json();

      setMenu(data);

      if (data.length && !category) {
        setCategory(data[0].category);
      }
    };

    load();
  }, []);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  /* ================= ADD ITEM ================= */

  const addItem = async (m: MenuItem) => {
    if (loading) return;

    setLoading(true);

    try {
      await fetch(`/api/counter/orders/${orderId}/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ menuItemId: m._id }),
      });

      await fetchOrder();
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
      return i.category === category;
    });
  }, [menu, category, search]);

  /* ================= TOTAL ================= */

  const total = useMemo(() => {
    return items
      .filter((i) => i.kitchenStatus !== 'draft')
      .reduce((sum, i) => sum + i.priceSnapshot * i.quantity, 0);
  }, [items]);

  const label = () => {
    if (order?.type === 'parcel') {
      return `Parcel #${order.parcelNumber}`;
    }
    if (order?.tableId?.tableNumber) {
      return `Table ${order.tableId.tableNumber}`;
    }
    return 'Order';
  };

  /* ================= CANCEL ================= */

  const cancelOrder = async () => {
    if (!confirm('Cancel order?')) return;

    await fetch(`/api/counter/orders/${orderId}/cancel`, {
      method: 'PATCH',
    });

    router.push(
      order?.type === 'parcel' ? '/counter/parcel' : '/counter/tables',
    );
  };

  /* ================= UI ================= */

  return (
    <div className="h-screen grid md:grid-cols-2 gap-4 p-4">

      {/* MENU */}
      <div className="space-y-4 overflow-y-auto">
        <h2 className="text-xl font-bold">Menu</h2>

        <Input
          placeholder="Search..."
          value={search}
          onChange={(e: any) => setSearch(e.target.value)}
        />

        <Select
          value={category}
          onChange={(e: any) => setCategory(e.target.value)}
        >
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </Select>

        <div className="grid grid-cols-2 gap-3">
          {filteredMenu.map((item) => (
            <Card
              key={item._id}
              onClick={() => addItem(item)}
              className="p-3 cursor-pointer hover:shadow-lg"
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
        <h2 className="text-xl font-bold mb-4">{label()}</h2>

        <div className="flex-1 overflow-y-auto space-y-3">
          {items.map((i) => (
            <Card key={i._id} className="p-3 flex justify-between">
              <div>
                <p>{i.nameSnapshot}</p>
                <p className="text-xs">{i.kitchenStatus}</p>
              </div>
              <span>x{i.quantity}</span>
            </Card>
          ))}
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>₹{total}</span>
          </div>

          <Button
            className="w-full mt-3 bg-green-600"
            onClick={() => router.push(`/counter/bill/${orderId}`)}
          >
            View Bill
          </Button>

          <Button
            className="w-full mt-3 bg-yellow-600"
            onClick={cancelOrder}
          >
            Cancel Order
          </Button>
        </div>
      </div>

    </div>
  );
}