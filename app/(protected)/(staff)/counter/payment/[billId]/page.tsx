'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { useNotification } from '@/app/components/notification';

type PaymentMethod = 'cash' | 'upi' | 'card';

interface PaymentRow {
  method: PaymentMethod;
  amount: number;
}

export default function PaymentPage() {
  const params = useParams<{ billId: string }>();
  const router = useRouter();
  const notification = useNotification();

  const billId = params.billId;

  const [totalAmount, setTotalAmount] = useState(0);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!billId) return;

    const load = async () => {
      try {
        const res = await fetch(`/api/counter/bills/${billId}`, {
          cache: 'no-store',
          credentials: 'include',
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          notification.error(data?.error || 'Failed to load bill');
          return;
        }

        const amount = Number(data?.bill?.totalAmount || 0);

        setTotalAmount(amount);
        setPayments([{ method: 'cash', amount }]);
      } catch (err) {
        console.error(err);
        notification.error('Failed to load bill');
      } finally {
        setPageLoading(false);
      }
    };

    load();
  }, [billId, notification]);

  const paidAmount = useMemo(
    () => payments.reduce((sum, p) => sum + Number(p.amount || 0), 0),
    [payments],
  );

  const remaining = useMemo(
    () => Number((totalAmount - paidAmount).toFixed(2)),
    [totalAmount, paidAmount],
  );

  const updateMethod = (index: number, method: PaymentMethod) => {
    setPayments((prev) =>
      prev.map((row, i) => (i === index ? { ...row, method } : row)),
    );
  };

  const updateAmount = (index: number, amount: number) => {
    setPayments((prev) =>
      prev.map((row, i) =>
        i === index ? { ...row, amount: amount < 0 ? 0 : amount } : row,
      ),
    );
  };

  const addSplit = () => {
    setPayments((prev) => [...prev, { method: 'cash', amount: 0 }]);
  };

  const removeSplit = (index: number) => {
    setPayments((prev) => prev.filter((_, i) => i !== index));
  };

  const fillFull = (method: PaymentMethod) => {
    setPayments([{ method, amount: totalAmount }]);
  };

  const handlePayment = async () => {
    if (!billId || processing) return;

    if (remaining !== 0) {
      notification.warning('Payment total must match bill amount');
      return;
    }

    try {
      setProcessing(true);

      const res = await fetch(`/api/counter/bills/${billId}/pay`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payments }),
        credentials: 'include',
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        notification.error(data?.error || 'Payment failed');
        setProcessing(false);
        return;
      }

      router.replace(`/counter/feedback/${data.orderId}`);
    } catch (err) {
      console.error(err);
      notification.error('Something went wrong while completing payment');
      setProcessing(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="px-4 py-6 md:px-6">
        <div className="mx-auto max-w-3xl text-center text-gray-500">
          Loading payment...
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 py-4 sm:px-4 md:px-6 md:py-6">
      <div className="mx-auto max-w-3xl space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Payment</h1>
          <p className="text-sm text-gray-500 mt-1">
            Complete full payment or split across multiple methods.
          </p>
        </div>

        {/* Top Summary */}
        <div className="grid grid-cols-2 gap-3">
          <Card
            variant="ghost"
            hover={false}
            className="p-4 border border-[#3b2a1a]/15 bg-transparent shadow-none"
          >
            <p className="text-xs md:text-sm text-gray-500">Bill Total</p>
            <p className="text-2xl font-bold mt-1">₹{totalAmount}</p>
          </Card>

          <Card
            variant="ghost"
            hover={false}
            className="p-4 border border-[#3b2a1a]/15 bg-transparent shadow-none"
          >
            <p className="text-xs md:text-sm text-gray-500">Remaining</p>
            <p
              className={`text-2xl font-bold mt-1 ${
                remaining === 0 ? 'text-green-700' : 'text-red-600'
              }`}
            >
              ₹{remaining}
            </p>
          </Card>
        </div>

        {/* Quick Fill */}
        <Card
          variant="ghost"
          hover={false}
          className="p-4 border border-[#3b2a1a]/15 bg-transparent shadow-none"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold">Quick Fill</h2>
              <p className="text-sm text-gray-500 mt-1">
                Set full amount to one payment method instantly.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => fillFull('cash')}
              >
                Cash
              </Button>

              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => fillFull('upi')}
              >
                UPI
              </Button>

              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => fillFull('card')}
              >
                Card
              </Button>
            </div>
          </div>
        </Card>

        {/* Payment Entries */}
        <Card
          variant="ghost"
          hover={false}
          className="p-4 md:p-5 border border-[#3b2a1a]/15 bg-transparent shadow-none"
        >
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-bold">Payment Entries</h2>
              <p className="text-sm text-gray-500 mt-1">
                Add one or more payment splits.
              </p>
            </div>

            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={addSplit}
            >
              + Split
            </Button>
          </div>

          <div className="space-y-3">
            {payments.map((p, i) => (
              <div
                key={i}
                className="rounded-2xl border border-[#3b2a1a]/10 bg-transparent p-4"
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                  <div className="space-y-1.5">
                    <label
                      htmlFor={`payment-method-${i}`}
                      className="block text-xs font-medium text-gray-500"
                    >
                      Payment Method
                    </label>

                    <select
                      id={`payment-method-${i}`}
                      value={p.method}
                      onChange={(e) =>
                        updateMethod(i, e.target.value as PaymentMethod)
                      }
                      className="w-full rounded-xl border border-[#3b2a1a]/15 bg-transparent px-3 py-2.5 text-sm outline-none transition focus:border-[#3b2a1a]/30"
                    >
                      <option value="cash">Cash</option>
                      <option value="upi">UPI</option>
                      <option value="card">Card</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor={`payment-amount-${i}`}
                      className="block text-xs font-medium text-gray-500"
                    >
                      Amount
                    </label>

                    <input
                      id={`payment-amount-${i}`}
                      type="number"
                      min="0"
                      value={p.amount}
                      onChange={(e) =>
                        updateAmount(i, Number(e.target.value) || 0)
                      }
                      className="w-full rounded-xl border border-[#3b2a1a]/15 bg-transparent px-3 py-2.5 text-sm outline-none transition focus:border-[#3b2a1a]/30"
                      placeholder="Enter amount"
                    />
                  </div>

                  {payments.length > 1 && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="border-red-500 text-red-700 sm:h-[42px]"
                      onClick={() => removeSplit(i)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Footer Summary */}
        <Card
          variant="ghost"
          hover={false}
          className="p-4 border border-[#3b2a1a]/15 bg-transparent shadow-none"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Paid</span>
              <span className="font-medium">₹{paidAmount}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Payment Rows</span>
              <Badge variant="outline" className="bg-transparent">
                {payments.length}
              </Badge>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#3b2a1a]/10">
              <span className="text-base font-bold">Remaining</span>
              <span
                className={`text-lg font-bold ${
                  remaining === 0 ? 'text-green-700' : 'text-red-600'
                }`}
              >
                ₹{remaining}
              </span>
            </div>

            <Button
              type="button"
              className="w-full mt-2"
              disabled={processing || remaining !== 0}
              onClick={handlePayment}
            >
              {processing ? 'Processing...' : 'Complete Payment'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
