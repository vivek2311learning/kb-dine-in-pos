'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/app/components/ui/button';

interface OrderItem {
  _id: string;
  nameSnapshot: string;
  priceSnapshot: number;
  quantity: number;
  served: boolean;
  cancelled?: boolean;
}

export default function BillPage() {
  const params = useParams();
  const router = useRouter();

  const orderId = params.orderId as string;

  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  /* ================= LOAD ORDER ================= */

  useEffect(() => {
    if (!orderId) return;

    const load = async () => {
      try {
        const res = await fetch(`/api/counter/orders/${orderId}`, {
          cache: 'no-store',
        });

        if (!res.ok) return;

        const data = await res.json();

        /* ✅ ONLY SERVED ITEMS */
        const served = (data.items || []).filter(
          (i: OrderItem) => i.served && !i.cancelled,
        );

        setItems(served);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [orderId]);

  /* ================= TOTAL ================= */

  const subtotal = useMemo(() => {
    return items.reduce((sum, i) => sum + i.priceSnapshot * i.quantity, 0);
  }, [items]);

  /* ================= CREATE BILL ================= */

  const handleCreateBill = async () => {
    if (!orderId || items.length === 0 || processing) return;

    try {
      setProcessing(true);

      /* ================= CREATE BILL ================= */

      const res = await fetch('/api/counter/bills/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Bill failed');
        setProcessing(false);
        return;
      }

      /* ================= PRINT ================= */

      const printRes = await fetch(`/api/counter/bills/${data._id}/print`, {
        credentials: 'include',
      });

      if (!printRes.ok) {
        console.error('❌ Print API failed');
      }

      const html = await printRes.text();

      const printWindow = window.open('', '_blank');

      if (printWindow && html) {
        printWindow.document.open();
        printWindow.document.write(html);
        printWindow.document.close();

        printWindow.focus();

        setTimeout(() => {
          printWindow.print();

          /* ✅ REDIRECT AFTER PRINT */
          setTimeout(() => {
            router.push(`/counter/payment/${data._id}`);
          }, 500);
        }, 300);
      } else {
        console.warn('⚠️ Popup blocked');

        /* fallback redirect */
        router.push(`/counter/payment/${data._id}`);
      }
    } catch (err) {
      console.error(err);
      setProcessing(false);
    }
  };
  /* ================= UI ================= */

  if (loading) {
    return <div className="p-6 text-gray-500">Loading bill...</div>;
  }

  return (
    <div className="p-4 md:p-6 max-w-xl mx-auto space-y-4">
      <h1 className="text-xl md:text-2xl font-bold text-center">
        Bill Summary
      </h1>

      {/* ITEMS */}

      <div className="border rounded-xl p-4 space-y-2 bg-white">
        {items.map((item) => (
          <div
            key={item._id}
            className="flex justify-between border-b py-2 text-sm"
          >
            <span>
              {item.nameSnapshot} × {item.quantity}
            </span>

            <span>₹{item.priceSnapshot * item.quantity}</span>
          </div>
        ))}
      </div>

      {/* TOTAL */}

      <div className="border rounded-xl p-4 bg-white">
        <div className="flex justify-between font-semibold text-lg">
          <span>Subtotal</span>
          <span>₹{subtotal}</span>
        </div>

        <p className="text-xs text-gray-500 mt-1">
          * GST will be applied automatically
        </p>
      </div>

      {/* ACTION */}

      <Button
        className="w-full bg-green-600 text-white py-3 text-lg"
        disabled={items.length === 0 || processing}
        onClick={handleCreateBill}
      >
        {processing ? 'Processing...' : '🧾 print bill'}
      </Button>
    </div>
  );
}
