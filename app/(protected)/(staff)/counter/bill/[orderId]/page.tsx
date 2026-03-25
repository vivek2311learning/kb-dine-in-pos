'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { useNotification } from '@/app/components/notification';

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
  const notification = useNotification();

  const orderId = params.orderId as string;

  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const [discount, setDiscount] = useState(0);
  const [adjustAmount, setAdjustAmount] = useState(0);
  const [customerPhone, setCustomerPhone] = useState('');

  useEffect(() => {
    if (!orderId) return;

    const load = async () => {
      try {
        setLoading(true);
        setError('');

        const res = await fetch(`/api/counter/orders/${orderId}`, {
          cache: 'no-store',
          credentials: 'include',
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          setError(data?.error || 'Failed to load bill data');
          setItems([]);
          return;
        }

        const served = (data.items || []).filter(
          (i: OrderItem) => i.served && !i.cancelled,
        );

        setItems(served);
      } catch (err) {
        console.error(err);
        setError('Failed to load bill data');
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

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data?.error || 'Bill creation failed');
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
            router.replace(`/counter/payment/${bill._id}`);
          }, 500);
        }, 300);
      } else {
        router.replace(`/counter/payment/${bill._id}`);
      }
    } catch (err: any) {
      console.error(err);
      notification.error(err.message || 'Something went wrong');
      setProcessing(false);
    }
  };

  const handleWhatsAppBill = async () => {
    if (!orderId || items.length === 0 || processing) return;

    const phone = normalizeIndianPhone(customerPhone);

    if (!phone) {
      notification.warning('Enter valid customer mobile number');
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

      router.replace(`/counter/payment/${bill._id}`);
    } catch (err: any) {
      console.error(err);
      notification.error(err.message || 'Something went wrong');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="px-4 py-6 md:px-6">
        <div className="mx-auto max-w-3xl text-center text-gray-500">
          Loading bill...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-6 md:px-6">
        <div className="mx-auto max-w-3xl">
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
              onClick={() => router.refresh()}
            >
              Retry
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 py-4 sm:px-4 md:px-6 md:py-6">
      <div className="mx-auto max-w-3xl space-y-5">
        <div className="text-center">
          <h1 className="text-2xl md:text-3xl font-bold">Bill Summary</h1>
          <p className="text-sm text-gray-500 mt-1">
            Review served items, apply discount or adjustment, and continue to
            payment.
          </p>
        </div>

        <Card
          variant="ghost"
          hover={false}
          className="p-4 md:p-5 border border-[#3b2a1a]/15 bg-transparent shadow-none"
        >
          <div className="space-y-3">
            <h2 className="text-lg font-bold">Served Items</h2>

            {items.length === 0 ? (
              <p className="text-sm text-gray-500">No served items found.</p>
            ) : (
              items.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between border-b border-[#3b2a1a]/10 py-2 text-sm last:border-b-0"
                >
                  <span>
                    {item.nameSnapshot} × {item.quantity}
                  </span>
                  <span>₹{item.priceSnapshot * item.quantity}</span>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card
          variant="ghost"
          hover={false}
          className="p-4 md:p-5 border border-[#3b2a1a]/15 bg-transparent shadow-none space-y-4"
        >
          <div>
            <label className="block text-sm font-medium mb-1">
              Customer Mobile Number
            </label>
            <Input
              type="tel"
              value={customerPhone}
              onChange={(e: any) => setCustomerPhone(e.target.value)}
              placeholder="9876543210"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Discount</label>
            <Input
              type="number"
              min="0"
              value={discount}
              onChange={(e: any) => setDiscount(Number(e.target.value) || 0)}
              placeholder="Enter discount"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Adjust Amount
            </label>
            <Input
              type="number"
              min="0"
              value={adjustAmount}
              onChange={(e: any) =>
                setAdjustAmount(Number(e.target.value) || 0)
              }
              placeholder="Enter adjust amount"
            />
          </div>

          <div className="space-y-2 pt-2 border-t border-[#3b2a1a]/10">
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

            <div className="flex justify-between font-semibold text-lg pt-1">
              <span>Estimated Total</span>
              <span>₹{estimatedTotal}</span>
            </div>
          </div>

          <p className="text-xs text-gray-500">
            GST will be applied automatically in the final bill.
          </p>
        </Card>

        <div
          className={`grid gap-3 ${
            canShowWhatsAppButton ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'
          }`}
        >
          <Button
            type="button"
            className="w-full"
            disabled={items.length === 0 || processing}
            onClick={handlePrintBill}
          >
            {processing ? 'Processing...' : 'Print Bill'}
          </Button>

          {canShowWhatsAppButton && (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={items.length === 0 || processing}
              onClick={handleWhatsAppBill}
            >
              {processing ? 'Processing...' : 'WhatsApp Bill'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
