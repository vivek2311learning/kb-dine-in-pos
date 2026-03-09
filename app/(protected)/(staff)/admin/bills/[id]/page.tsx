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

  const fetchBill = async () => {
    const res = await fetch(`/api/admin/bills/${billId}`);
    const data = await res.json();
    setBill(data);
    setLoading(false);
  };

  useEffect(() => {
    if (billId) fetchBill();
  }, [billId]);

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

  if (loading) return <div className="p-6">Loading...</div>;
  if (!bill) return <div className="p-6">Bill not found</div>;

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">Bill #{bill.billNumber}</h1>

      <Card className="p-4 space-y-2">
        <p>Total: ₹{bill.totalAmount}</p>
        <p>
          Status:{' '}
          {bill.isRefunded ? 'Refunded' : bill.isPaid ? 'Paid' : 'Unpaid'}
        </p>

        {bill.isRefunded && (
          <>
            <p>Refunded At: {new Date(bill.refundAt).toLocaleString()}</p>
            <p>Reason: {bill.refundReason}</p>
          </>
        )}
      </Card>

      <Card className="p-4 space-y-2">
        <h2 className="font-semibold">Items</h2>
        {bill.items?.map((item: any) => (
          <div key={item._id} className="flex justify-between">
            <span>
              {item.nameSnapshot} x{item.quantity}
            </span>
            <span>₹{item.priceSnapshot * item.quantity}</span>
          </div>
        ))}
      </Card>

      <Card className="p-4 space-y-2">
        <h2 className="font-semibold">Payments</h2>
        {bill.payments?.map((p: any, i: number) => (
          <div key={i} className="flex justify-between">
            <span>{p.method}</span>
            <span>₹{p.amount}</span>
          </div>
        ))}
      </Card>

      <div className="flex gap-4">
        <Button onClick={() => window.print()}>Reprint</Button>

        {!bill.isRefunded && bill.isPaid && (
          <Button className="bg-red-600 text-white" onClick={handleRefund}>
            Refund
          </Button>
        )}
      </div>
    </div>
  );
}
