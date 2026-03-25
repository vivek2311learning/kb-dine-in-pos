'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';

export default function BillDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const billId = id as string;

  const [bill, setBill] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const loadBill = async () => {
    if (!billId) return;

    try {
      setLoading(true);

      const res = await fetch(`/api/admin/bills/${billId}`, {
        cache: 'no-store',
        credentials: 'include',
      });

      if (!res.ok) {
        setBill(null);
        return;
      }

      const data = await res.json();
      setBill(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBill();
  }, [billId]);

  const handlePrint = async () => {
    try {
      const res = await fetch(`/api/counter/bills/${billId}/print`, {
        credentials: 'include',
      });

      if (!res.ok) {
        alert('Print failed');
        return;
      }

      const html = await res.text();
      const win = window.open('', '_blank');

      if (!win) return;

      win.document.open();
      win.document.write(html);
      win.document.close();

      setTimeout(() => {
        win.print();
        win.close();
      }, 300);
    } catch (err) {
      console.error(err);
      alert('Print failed');
    }
  };

  const handlePayment = () => {
    if (!bill?._id) return;
    router.push(`/counter/payment/${bill._id}`);
  };

  const handleRefund = async () => {
    if (!confirm('Refund this bill?')) return;

    try {
      setActionLoading(true);

      const res = await fetch(`/api/admin/bills/${billId}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          reason: 'admin_refund',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data?.error || 'Refund failed');
        return;
      }

      await loadBill();
      alert('Refund successful');
    } catch (err) {
      console.error(err);
      alert('Something went wrong');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenSharedBill = () => {
    if (!bill?.shareUrl) return;
    window.open(bill.shareUrl, '_blank');
  };

  if (loading) {
    return <div className="p-6 text-gray-500">Loading bill...</div>;
  }

  if (!bill) {
    return <div className="p-6 text-red-500">Bill not found</div>;
  }

  const statusLabel = bill.isRefunded
    ? 'Refunded'
    : bill.isPaid
      ? 'Paid'
      : 'Unpaid';

  const statusClass = bill.isRefunded
    ? 'border-red-700 text-red-700 bg-transparent'
    : bill.isPaid
      ? 'border-green-700 text-green-700 bg-transparent'
      : 'border-yellow-700 text-yellow-800 bg-transparent';

  return (
    <div className="px-3 py-4 sm:px-4 md:px-6 md:py-6">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* HEADER */}
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Bill #{bill.billNumber}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Full bill details, payment status, reprint, and refund actions.
            </p>
          </div>

          <span
            className={`text-sm px-3 py-1.5 rounded-md border self-start ${statusClass}`}
          >
            {statusLabel}
          </span>
        </div>

        {/* TOP INFO */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card
            variant="ghost"
            hover={false}
            className="p-4 border border-[#3b2a1a]/15 bg-transparent shadow-none"
          >
            <p className="text-xs text-gray-500">Bill Number</p>
            <p className="text-xl font-bold mt-1">#{bill.billNumber}</p>
          </Card>

          <Card
            variant="ghost"
            hover={false}
            className="p-4 border border-[#3b2a1a]/15 bg-transparent shadow-none"
          >
            <p className="text-xs text-gray-500">Printed At</p>
            <p className="text-sm font-medium mt-1">
              {bill.printedAt ? new Date(bill.printedAt).toLocaleString() : '—'}
            </p>
          </Card>

          <Card
            variant="ghost"
            hover={false}
            className="p-4 border border-[#3b2a1a]/15 bg-transparent shadow-none"
          >
            <p className="text-xs text-gray-500">Customer</p>
            <p className="text-sm font-medium mt-1">
              {bill.customerPhone || '—'}
            </p>
          </Card>
        </div>

        {/* ITEMS + SUMMARY */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1.2fr_0.8fr]">
          <Card
            variant="ghost"
            hover={false}
            className="p-5 border border-[#3b2a1a]/15 bg-transparent shadow-none"
          >
            <h2 className="text-lg font-bold mb-4">Items</h2>

            {bill.items?.length ? (
              <div className="space-y-3">
                {bill.items.map((i: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-start justify-between gap-3 border-b border-[#3b2a1a]/10 pb-3 last:border-b-0 last:pb-0"
                  >
                    <div>
                      <p className="font-medium">
                        {i.nameSnapshot} × {i.quantity}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        ₹{i.priceSnapshot} each
                      </p>
                    </div>

                    <p className="font-semibold">
                      ₹{i.priceSnapshot * i.quantity}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No items found.</p>
            )}
          </Card>

          <Card
            variant="ghost"
            hover={false}
            className="p-5 border border-[#3b2a1a]/15 bg-transparent shadow-none"
          >
            <h2 className="text-lg font-bold mb-4">Summary</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium">₹{bill.subtotal || 0}</span>
              </div>

              <div className="flex justify-between text-red-700">
                <span>Discount</span>
                <span className="font-medium">- ₹{bill.discount || 0}</span>
              </div>

              <div className="flex justify-between text-red-700">
                <span>Adjust Amount</span>
                <span className="font-medium">- ₹{bill.adjustAmount || 0}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Tax</span>
                <span className="font-medium">₹{bill.tax || 0}</span>
              </div>

              <div className="flex justify-between pt-3 border-t border-[#3b2a1a]/10 text-base font-bold">
                <span>Total</span>
                <span>₹{bill.totalAmount || 0}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Paid Amount</span>
                <span className="font-medium">₹{bill.paidAmount || 0}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* PAYMENTS */}
        {bill.payments?.length > 0 && (
          <Card
            variant="ghost"
            hover={false}
            className="p-5 border border-[#3b2a1a]/15 bg-transparent shadow-none"
          >
            <h2 className="text-lg font-bold mb-4">Payments</h2>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {bill.payments.map((p: any, index: number) => (
                <Card
                  key={index}
                  variant="ghost"
                  hover={false}
                  className="p-4 border border-[#3b2a1a]/10 bg-transparent shadow-none"
                >
                  <p className="text-xs text-gray-500">Method</p>
                  <p className="text-lg font-bold mt-1 uppercase">
                    {String(p.method)}
                  </p>

                  <p className="text-xs text-gray-500 mt-3">Amount</p>
                  <p className="text-lg font-semibold mt-1">₹{p.amount}</p>
                </Card>
              ))}
            </div>
          </Card>
        )}

        {/* REFUND */}
        {bill.isRefunded && (
          <Card
            variant="ghost"
            hover={false}
            className="p-5 border border-red-200 bg-transparent shadow-none"
          >
            <h2 className="text-lg font-bold text-red-700 mb-4">
              Refund Details
            </h2>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3 text-sm">
              <div className="flex justify-between gap-3 md:block">
                <span className="text-gray-500">Refund Amount</span>
                <p className="font-medium mt-1">₹{bill.refundAmount || 0}</p>
              </div>

              <div className="flex justify-between gap-3 md:block">
                <span className="text-gray-500">Refund Reason</span>
                <p className="font-medium mt-1">{bill.refundReason || '—'}</p>
              </div>

              <div className="flex justify-between gap-3 md:block">
                <span className="text-gray-500">Refunded At</span>
                <p className="font-medium mt-1">
                  {bill.refundAt
                    ? new Date(bill.refundAt).toLocaleString()
                    : '—'}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* ACTIONS */}
        <Card
          variant="ghost"
          hover={false}
          className="p-4 border border-[#3b2a1a]/15 bg-transparent shadow-none"
        >
          <div className="flex flex-wrap gap-3">
            <Button type="button" onClick={handlePrint}>
              Reprint Bill
            </Button>

            {bill.shareUrl && (
              <Button
                type="button"
                variant="outline"
                onClick={handleOpenSharedBill}
              >
                View Shared Bill
              </Button>
            )}

            {!bill.isPaid && !bill.isRefunded && (
              <Button
                type="button"
                className="bg-green-600"
                onClick={handlePayment}
              >
                Payment
              </Button>
            )}

            {bill.isPaid && !bill.isRefunded && (
              <Button
                type="button"
                className="bg-red-600"
                onClick={handleRefund}
                disabled={actionLoading}
              >
                {actionLoading ? 'Refunding...' : 'Refund'}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
