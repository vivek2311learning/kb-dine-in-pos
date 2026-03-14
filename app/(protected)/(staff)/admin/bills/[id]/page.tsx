'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';

export default function BillDetailPage() {
  const params = useParams();
  const billId = params.id as string;

  const [bill, setBill] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  /* ---------------- FETCH BILL ---------------- */

  const fetchBill = async () => {
    try {
      const res = await fetch(`/api/admin/bills/${billId}`, {
        cache: 'no-store',
      });

      const data = await res.json();

      setBill(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (billId) fetchBill();
  }, [billId]);

  /* ---------------- PRINT ---------------- */

  const handlePrint = () => {
    const content = document.getElementById('bill-print')?.innerHTML;

    if (!content) return;

    const win = window.open('', '', 'width=400,height=600');

    if (!win) return;

    win.document.write(`
<html>
<head>
<title>Bill</title>
<style>
body{font-family:sans-serif;padding:20px}
table{width:100%;border-collapse:collapse}
td{padding:6px 0}
.total{font-weight:bold;border-top:1px solid #ccc}
</style>
</head>
<body>
${content}
</body>
</html>
`);

    win.document.close();
    win.print();
  };

  /* ---------------- REFUND ---------------- */

  const handleRefund = async () => {
    const reason = prompt('Refund reason?');

    if (!reason) return;

    await fetch(`/api/admin/bills/${billId}/refund`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });

    fetchBill();
  };

  /* ---------------- STATUS BADGE ---------------- */

  const statusBadge = () => {
    if (bill.isRefunded)
      return (
        <span className="px-3 py-1 text-xs rounded bg-red-100 text-red-600">
          Refunded
        </span>
      );

    if (bill.isPaid)
      return (
        <span className="px-3 py-1 text-xs rounded bg-green-100 text-green-600">
          Paid
        </span>
      );

    return (
      <span className="px-3 py-1 text-xs rounded bg-yellow-100 text-yellow-600">
        Unpaid
      </span>
    );
  };

  if (loading) return <div className="p-6 text-gray-500">Loading bill...</div>;

  if (!bill) return <div className="p-6 text-gray-500">Bill not found</div>;

  const total =
    bill.totalAmount ?? bill.subtotal + (bill.tax || 0) - (bill.discount || 0);

  const paymentTotal =
    bill.payments?.reduce((sum: number, p: any) => sum + p.amount, 0) || 0;

  /* ---------------- UI ---------------- */

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">
      {/* HEADER */}

      <Card className="p-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Bill #{bill.billNumber}</h1>

          <p className="text-xs text-gray-500">
            {bill.printedAt && new Date(bill.printedAt).toLocaleString()}
          </p>
        </div>

        {statusBadge()}
      </Card>

      {/* PRINT AREA */}

      <div id="bill-print" className="space-y-6">
        {/* ITEMS */}

        <Card className="p-4">
          <h2 className="font-semibold text-lg mb-3">Items</h2>

          <div className="space-y-2">
            {bill.items?.map((item: any) => {
              const price = item.priceSnapshot * item.quantity;

              return (
                <div
                  key={item._id}
                  className="flex justify-between text-sm border-b pb-1"
                >
                  <span>
                    {item.nameSnapshot} × {item.quantity}
                  </span>

                  <span className="font-medium">₹{price}</span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* SUMMARY */}

        <Card className="p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>₹{bill.subtotal}</span>
          </div>

          {bill.tax > 0 && (
            <div className="flex justify-between text-sm">
              <span>Tax</span>
              <span>₹{bill.tax}</span>
            </div>
          )}

          {bill.discount > 0 && (
            <div className="flex justify-between text-sm">
              <span>Discount</span>
              <span>- ₹{bill.discount}</span>
            </div>
          )}

          <div className="flex justify-between text-lg font-bold border-t pt-2">
            <span>Total</span>
            <span>₹{total}</span>
          </div>

          {bill.isRefunded && (
            <div className="text-sm text-red-600 pt-2">
              <p>Refunded At: {new Date(bill.refundAt).toLocaleString()}</p>

              <p>Reason: {bill.refundReason}</p>
            </div>
          )}
        </Card>

        {/* PAYMENTS */}

        <Card className="p-4">
          <h2 className="font-semibold text-lg mb-3">Payments</h2>

          {bill.payments?.length === 0 && (
            <p className="text-sm text-gray-500">No payment</p>
          )}

          <div className="space-y-2">
            {bill.payments?.map((p: any, i: number) => {
              return (
                <div
                  key={i}
                  className="flex justify-between text-sm border-b pb-1"
                >
                  <span className="capitalize">{p.method}</span>

                  <span className="font-medium">₹{p.amount}</span>
                </div>
              );
            })}
          </div>

          {/* PAYMENT TOTAL */}

          {bill.payments?.length > 0 && (
            <div className="flex justify-between font-semibold text-base border-t pt-3 mt-3">
              <span>Total Paid</span>

              <span>₹{paymentTotal}</span>
            </div>
          )}
        </Card>
      </div>

      {/* ACTIONS */}

      <div className="flex flex-wrap gap-3">
        <Button onClick={handlePrint}>Reprint Bill</Button>

        {!bill.isRefunded && bill.isPaid && (
          <Button className="bg-red-600 text-white" onClick={handleRefund}>
            Refund
          </Button>
        )}
      </div>
    </div>
  );
}
