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

  const [discount, setDiscount] = useState(0);
  const [adjustAmount, setAdjustAmount] = useState(0);
  const [customerPhone, setCustomerPhone] = useState('');

  useEffect(() => {
    if (!orderId) return;

    const load = async () => {
      try {
        const res = await fetch(`/api/counter/orders/${orderId}`, {
          cache: 'no-store',
          credentials: 'include',
        });

        if (!res.ok) return;

        const data = await res.json();

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

  const subtotal = useMemo(() => {
    return items.reduce((sum, i) => sum + i.priceSnapshot * i.quantity, 0);
  }, [items]);

  const taxableAmount = useMemo(() => {
    const value = subtotal - discount - adjustAmount;
    return value > 0 ? value : 0;
  }, [subtotal, discount, adjustAmount]);

  const estimatedTotal = useMemo(() => {
    return taxableAmount;
  }, [taxableAmount]);

  const normalizeIndianPhone = (phone: string) => {
    const digits = phone.replace(/\D/g, '');

    if (digits.length === 10) return `91${digits}`;
    if (digits.length === 12 && digits.startsWith('91')) return digits;

    return null;
  };

  const canShowWhatsAppButton = customerPhone.trim().length > 0;

  const createBill = async () => {
    const res = await fetch('/api/counter/bills/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId,
        discount,
        adjustAmount,
        customerPhone: customerPhone.trim(),
      }),
      credentials: 'include',
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Bill failed');
    }

    return data;
  };

  const handlePrintBill = async () => {
    if (!orderId || items.length === 0 || processing) return;

    try {
      setProcessing(true);

      const bill = await createBill();

      const printRes = await fetch(`/api/counter/bills/${bill._id}/print`, {
        credentials: 'include',
      });

      if (!printRes.ok) {
        throw new Error('Print API failed');
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

          setTimeout(() => {
            router.push(`/counter/payment/${bill._id}`);
          }, 500);
        }, 300);
      } else {
        router.push(`/counter/payment/${bill._id}`);
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Something went wrong');
      setProcessing(false);
    }
  };

  const handleWhatsAppBill = async () => {
    if (!orderId || items.length === 0 || processing) return;

    const phone = normalizeIndianPhone(customerPhone);

    if (!phone) {
      alert('Enter valid customer mobile number');
      return;
    }

    try {
      setProcessing(true);

      const bill = await createBill();

      const lines = items.map(
        (item) =>
          `${item.nameSnapshot} x ${item.quantity} - ₹${
            item.priceSnapshot * item.quantity
          }`,
      );

      const message = encodeURIComponent(
        [
          'Hello, your bill is ready.',
          '',
          `Bill #${bill.billNumber}`,
          ...lines,
          '',
          `Subtotal: ₹${bill.subtotal}`,
          `Discount: ₹${bill.discount || 0}`,
          `Adjust: ₹${bill.adjustAmount || 0}`,
          `Tax: ₹${bill.tax || 0}`,
          `Total: ₹${bill.totalAmount}`,
          '',
          `View full bill: ${bill.shareUrl}`,
        ].join('\n'),
      );

      window.open(`https://wa.me/${phone}?text=${message}`, '_blank');

      router.push(`/counter/payment/${bill._id}`);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Something went wrong');
      setProcessing(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-gray-500">Loading bill...</div>;
  }

  return (
    <div className="p-4 md:p-6 max-w-xl mx-auto space-y-4">
      <h1 className="text-xl md:text-2xl font-bold text-center">
        Bill Summary
      </h1>

      <div className="border rounded-xl p-4 space-y-2 bg-white">
        {items.map((item) => (
          <div
            key={item._id}
            className="flex justify-between border-b py-2 text-sm last:border-b-0"
          >
            <span>
              {item.nameSnapshot} × {item.quantity}
            </span>
            <span>₹{item.priceSnapshot * item.quantity}</span>
          </div>
        ))}
      </div>

      <div className="border rounded-xl p-4 bg-white space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Customer Mobile Number
          </label>
          <input
            type="tel"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            placeholder="9876543210"
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Discount</label>
          <input
            type="number"
            min="0"
            value={discount}
            onChange={(e) => setDiscount(Number(e.target.value) || 0)}
            className="w-full border rounded px-3 py-2"
            placeholder="Enter discount"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Adjust Amount
          </label>
          <input
            type="number"
            min="0"
            value={adjustAmount}
            onChange={(e) => setAdjustAmount(Number(e.target.value) || 0)}
            className="w-full border rounded px-3 py-2"
            placeholder="Enter adjust amount"
          />
        </div>

        <div className="space-y-2 pt-2 border-t">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>₹{subtotal}</span>
          </div>

          <div className="flex justify-between text-sm text-red-600">
            <span>Discount</span>
            <span>- ₹{discount}</span>
          </div>

          <div className="flex justify-between text-sm text-red-600">
            <span>Adjust Amount</span>
            <span>- ₹{adjustAmount}</span>
          </div>

          <div className="flex justify-between font-semibold text-lg">
            <span>Estimated Total</span>
            <span>₹{estimatedTotal}</span>
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-1">
          GST will be applied automatically in final bill.
        </p>
      </div>

      <div
        className={`grid gap-3 ${canShowWhatsAppButton ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}
      >
        <Button
          className="w-full bg-green-600 text-white py-3 text-lg"
          disabled={items.length === 0 || processing}
          onClick={handlePrintBill}
        >
          {processing ? 'Processing...' : '🧾 Print Bill'}
        </Button>

        {canShowWhatsAppButton && (
          <Button
            className="w-full bg-emerald-600 text-white py-3 text-lg"
            disabled={items.length === 0 || processing}
            onClick={handleWhatsAppBill}
          >
            {processing ? 'Processing...' : 'WhatsApp Bill'}
          </Button>
        )}
      </div>
    </div>
  );
}
