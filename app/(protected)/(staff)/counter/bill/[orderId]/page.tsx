'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/app/components/ui/button';

interface OrderItem {
  _id: string;
  nameSnapshot: string;
  priceSnapshot: number;
  quantity: number;
  kitchenStatus?: string;
}

export default function BillPage() {
  const params = useParams();

  const orderId = params.orderId as string;

  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;

    const loadOrder = async () => {
      try {
        const res = await fetch(`/api/counter/orders/${orderId}`);

        if (!res.ok) return;

        const data = await res.json();

        const servedItems = (data.items || []).filter(
          (i: OrderItem) => i.kitchenStatus?.toLowerCase() === 'served',
        );

        setItems(servedItems);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderId]);

  const total = items.reduce((sum, i) => sum + i.priceSnapshot * i.quantity, 0);

  if (loading) {
    return <div className="p-6">Loading bill...</div>;
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-6">Bill</h1>

      {items.map((item) => (
        <div key={item._id} className="flex justify-between border-b py-2">
          <span>
            {item.nameSnapshot} x {item.quantity}
          </span>
          <span>₹{item.priceSnapshot * item.quantity}</span>
        </div>
      ))}

      <div className="flex justify-between font-bold mt-4">
        <span>Total</span>
        <span>₹{total}</span>
      </div>
    </div>
  );
}
