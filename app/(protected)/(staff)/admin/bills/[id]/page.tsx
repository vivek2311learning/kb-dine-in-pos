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

  if (loading) return <div className="p-6 text-gray-500">Loading...</div>;
  if (!bill) return <div className="p-6">Not found</div>;

  const statusLabel = bill.isRefunded
    ? 'Refunded'
    : bill.isPaid
      ? 'Paid'
      : 'Unpaid';

  const statusClass = bill.isRefunded
    ? 'text-red-600'
    : bill.isPaid
      ? 'text-green-600'
      : 'text-yellow-600';

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">
      <Card className="p-4 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">Bill #{bill.billNumber}</h1>
          <p className="text-xs text-gray-500">
            {bill.printedAt ? new Date(bill.printedAt).toLocaleString() : '—'}
          </p>

          {bill.customerPhone && (
            <p className="text-xs text-gray-500 mt-1">
              Customer: {bill.customerPhone}
            </p>
          )}
        </div>

        <span className={`font-semibold ${statusClass}`}>{statusLabel}</span>
      </Card>

      <div id="bill-print" className="space-y-4">
        <Card className="p-4 space-y-2">
          {bill.items?.length ? (
            bill.items.map((i: any, index: number) => (
              <div key={index} className="flex justify-between text-sm">
                <span>
                  {i.nameSnapshot} × {i.quantity}
                </span>
                <span>₹{i.priceSnapshot * i.quantity}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No items found</p>
          )}
        </Card>

        <Card className="p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>₹{bill.subtotal || 0}</span>
          </div>

          <div className="flex justify-between text-sm text-red-600">
            <span>Discount</span>
            <span>- ₹{bill.discount || 0}</span>
          </div>

          <div className="flex justify-between text-sm text-red-600">
            <span>Adjust Amount</span>
            <span>- ₹{bill.adjustAmount || 0}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span>Tax</span>
            <span>₹{bill.tax || 0}</span>
          </div>

          <div className="flex justify-between font-bold text-lg pt-2 border-t">
            <span>Total</span>
            <span>₹{bill.totalAmount || 0}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span>Paid Amount</span>
            <span>₹{bill.paidAmount || 0}</span>
          </div>
        </Card>

        {bill.payments?.length > 0 && (
          <Card className="p-4 space-y-2">
            <h2 className="font-semibold">Payments</h2>

            {bill.payments.map((p: any, index: number) => (
              <div key={index} className="flex justify-between text-sm">
                <span>{String(p.method).toUpperCase()}</span>
                <span>₹{p.amount}</span>
              </div>
            ))}
          </Card>
        )}

        {bill.isRefunded && (
          <Card className="p-4 space-y-2">
            <h2 className="font-semibold text-red-600">Refund Details</h2>

            <div className="flex justify-between text-sm">
              <span>Refund Amount</span>
              <span>₹{bill.refundAmount || 0}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span>Refund Reason</span>
              <span>{bill.refundReason || '—'}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span>Refunded At</span>
              <span>
                {bill.refundAt ? new Date(bill.refundAt).toLocaleString() : '—'}
              </span>
            </div>
          </Card>
        )}
      </div>

      <div className="flex gap-3 flex-wrap">
        <Button onClick={handlePrint}>Reprint Bill</Button>

        {bill.shareUrl && (
          <Button variant="outline" onClick={handleOpenSharedBill}>
            View Shared Bill
          </Button>
        )}

        {!bill.isPaid && !bill.isRefunded && (
          <Button className="bg-green-600" onClick={handlePayment}>
            Payment
          </Button>
        )}

        {bill.isPaid && !bill.isRefunded && (
          <Button
            className="bg-red-600"
            onClick={handleRefund}
            disabled={actionLoading}
          >
            {actionLoading ? 'Refunding...' : 'Refund'}
          </Button>
        )}
      </div>
    </div>
  );
}
