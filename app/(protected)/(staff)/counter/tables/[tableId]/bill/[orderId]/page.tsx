'use client';

import { Button } from '@/app/components/ui/button';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface OrderItem {
  _id: string;
  nameSnapshot: string;
  priceSnapshot: number;
  quantity: number;
  kitchenStatus?: string;
}

export default function BillPage() {
  const params = useParams();
  const router = useRouter();

  const orderId = params.orderId as string;
  const tableId = params.tableId as string;

  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  /* ---------------- LOAD ORDER ---------------- */

  useEffect(() => {
    if (!orderId) return;

    const loadOrder = async () => {
      const res = await fetch(`/api/counter/orders/${orderId}`);

      if (!res.ok) {
        setLoading(false);
        return;
      }

      const data = await res.json();

      if (data.order?.status === 'paid') {
        router.replace('/counter/tables');
        return;
      }

      const servedItems = (data.items || []).filter(
        (i: OrderItem) => i.kitchenStatus?.toLowerCase() === 'served',
      );

      setItems(servedItems);
      setLoading(false);
    };

    loadOrder();
  }, [orderId]);

  /* ---------------- TOTAL ---------------- */

  const subtotal = items.reduce(
    (sum, item) => sum + item.priceSnapshot * item.quantity,
    0,
  );

  /* ---------------- PRINT + PAYMENT ---------------- */

  const handlePrintAndPay = async () => {
    if (!orderId || items.length === 0) return;

    const res = await fetch('/api/counter/bills/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId }),
    });

    if (!res.ok) {
      const err = await res.json();
      console.log(err);
      return;
    }

    const bill = await res.json();

    // 1️⃣ Print
    window.print();

    // 2️⃣ Small delay (ensures print dialog opens)
    setTimeout(() => {
      router.push(`/counter/tables/${tableId}/payment/${bill._id}`);
    }, 500);
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white">
      <h1 className="text-2xl font-bold mb-6 text-center">Bill Summary</h1>

      {items.length === 0 && (
        <div className="text-center text-gray-400">No served items yet</div>
      )}

      {items.map((item) => (
        <div key={item._id} className="flex justify-between border-b py-2">
          <span>
            {item.nameSnapshot} × {item.quantity}
          </span>
          <span>₹{item.priceSnapshot * item.quantity}</span>
        </div>
      ))}

      <div className="mt-6 text-lg font-bold flex justify-between border-t pt-4">
        <span>Total</span>
        <span>₹{subtotal}</span>
      </div>

      <div className="mt-6">
        <Button
          onClick={handlePrintAndPay}
          disabled={items.length === 0}
          className="w-full bg-amber-600 text-white py-2 rounded"
        >
          🖨 Print Bill & Proceed to Payment
        </Button>
      </div>
    </div>
  );
}
