'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';

interface BillData {
  bill: {
    _id: string;
    billNumber: number;
    subtotal: number;
    tax: number;
    discount: number;
    adjustAmount: number;
    totalAmount: number;
    customerPhone?: string;
    isPaid: boolean;
    paidAt?: string | null;
    isRefunded: boolean;
    refundAmount?: number;
    refundReason?: string;
    refundAt?: string | null;
    printedAt?: string | null;
    createdAt?: string | null;
  };
  order: {
    _id: string | null;
    type: 'dine-in' | 'parcel' | null;
    parcelNumber?: number | null;
    tableNumber?: number | null;
    status?: string | null;
    closedReason?: string | null;
    openedAt?: string | null;
    closedAt?: string | null;
  };
  items: Array<{
    _id: string;
    nameSnapshot: string;
    priceSnapshot: number;
    quantity: number;
  }>;
  payments: Array<{
    _id?: string;
    method: string;
    amount: number;
  }>;
}

export default function SharedBillPage() {
  const params = useParams();
  const token = params.token as string;

  const [data, setData] = useState<BillData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    const load = async () => {
      try {
        const res = await fetch(`/api/public/bills/${token}`, {
          cache: 'no-store',
        });

        const json = await res.json();

        if (!res.ok) {
          throw new Error(json.error || 'Failed to load bill');
        }

        setData(json);
      } catch (err) {
        console.error(err);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [token]);

  const orderLabel = useMemo(() => {
    if (!data?.order) return '-';

    if (data.order.type === 'parcel') {
      return `Parcel #${data.order.parcelNumber ?? '-'}`;
    }

    if (data.order.type === 'dine-in') {
      return `Table ${data.order.tableNumber ?? '-'}`;
    }

    return '-';
  }, [data]);

  const paymentSummary = useMemo(() => {
    if (!data?.payments?.length) return 'Unpaid';

    return data.payments
      .map((p) => `${String(p.method).toUpperCase()} ₹${p.amount}`)
      .join(', ');
  }, [data]);

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading bill...</div>;
  }

  if (!data) {
    return <div className="p-6 text-center text-red-500">Bill not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-sm border p-5 md:p-8 space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold">Restaurant Bill</h1>
          <p className="text-sm text-gray-500">Bill #{data.bill.billNumber}</p>
          <p className="text-sm text-gray-500">{orderLabel}</p>
          <p className="text-xs text-gray-400">
            {new Date(
              data.bill.printedAt || data.bill.createdAt || Date.now(),
            ).toLocaleString()}
          </p>
        </div>

        <div className="border rounded-xl p-4 space-y-3">
          {data.items.map((item) => (
            <div
              key={item._id}
              className="flex justify-between text-sm border-b last:border-b-0 pb-2 last:pb-0"
            >
              <span>
                {item.nameSnapshot} × {item.quantity}
              </span>
              <span>₹{item.priceSnapshot * item.quantity}</span>
            </div>
          ))}
        </div>

        <div className="border rounded-xl p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>₹{data.bill.subtotal}</span>
          </div>

          <div className="flex justify-between text-red-600">
            <span>Discount</span>
            <span>- ₹{data.bill.discount || 0}</span>
          </div>

          <div className="flex justify-between text-red-600">
            <span>Adjust Amount</span>
            <span>- ₹{data.bill.adjustAmount || 0}</span>
          </div>

          <div className="flex justify-between">
            <span>Tax</span>
            <span>₹{data.bill.tax || 0}</span>
          </div>

          <div className="flex justify-between font-bold text-lg pt-2 border-t">
            <span>Total</span>
            <span>₹{data.bill.totalAmount}</span>
          </div>
        </div>

        <div className="border rounded-xl p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Payment Status</span>
            <span
              className={
                data.bill.isRefunded
                  ? 'text-red-600 font-semibold'
                  : data.bill.isPaid
                    ? 'text-green-600 font-semibold'
                    : 'text-yellow-600 font-semibold'
              }
            >
              {data.bill.isRefunded
                ? 'Refunded'
                : data.bill.isPaid
                  ? 'Paid'
                  : 'Unpaid'}
            </span>
          </div>

          <div className="flex justify-between">
            <span>Payment Details</span>
            <span className="text-right">{paymentSummary}</span>
          </div>

          {data.bill.paidAt && (
            <div className="flex justify-between">
              <span>Paid At</span>
              <span>{new Date(data.bill.paidAt).toLocaleString()}</span>
            </div>
          )}

          {data.bill.isRefunded && (
            <>
              <div className="flex justify-between">
                <span>Refund Amount</span>
                <span>₹{data.bill.refundAmount || 0}</span>
              </div>

              {data.bill.refundReason && (
                <div className="flex justify-between gap-4">
                  <span>Refund Reason</span>
                  <span className="text-right">{data.bill.refundReason}</span>
                </div>
              )}

              {data.bill.refundAt && (
                <div className="flex justify-between">
                  <span>Refunded At</span>
                  <span>{new Date(data.bill.refundAt).toLocaleString()}</span>
                </div>
              )}
            </>
          )}
        </div>

        <p className="text-center text-xs text-gray-500">
          Thank you for visiting.
        </p>
      </div>
    </div>
  );
}
