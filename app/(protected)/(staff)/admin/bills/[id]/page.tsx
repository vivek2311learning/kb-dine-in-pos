'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';

export default function BillDetailPage() {
  const { id } = useParams();
  const billId = id as string;

  const [bill, setBill] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!billId) return;

    const load = async () => {
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

    load();
  }, [billId]);

  /* 🔥 PRINT (FIXED) */
  const handlePrint = () => {
    const content = document.getElementById('bill-print')?.innerHTML;
    if (!content) return;

    const win = window.open('', '_blank');

    if (!win) return;

    win.document.write(`
      <html>
        <head>
          <title>Bill</title>
          <style>
            body{font-family:sans-serif;padding:20px}
            .row{display:flex;justify-content:space-between}
          </style>
        </head>
        <body>${content}</body>
      </html>
    `);

    win.document.close();

    setTimeout(() => {
      win.print();
      win.close();
    }, 300);
  };

  if (loading) return <div className="p-6 text-gray-500">Loading...</div>;
  if (!bill) return <div className="p-6">Not found</div>;

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">

      <Card className="p-4 flex justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bill #{bill.billNumber}</h1>
          <p className="text-xs text-gray-500">
            {bill.printedAt && new Date(bill.printedAt).toLocaleString()}
          </p>
        </div>

        <span className="text-green-600 font-semibold">Paid</span>
      </Card>

      <div id="bill-print" className="space-y-4">

        <Card className="p-4 space-y-2">
          {bill.items?.map((i: any) => (
            <div key={i._id} className="flex justify-between text-sm">
              <span>{i.nameSnapshot} × {i.quantity}</span>
              <span>₹{i.priceSnapshot * i.quantity}</span>
            </div>
          ))}
        </Card>

        <Card className="p-4">
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>₹{bill.totalAmount}</span>
          </div>
        </Card>

      </div>

      <Button onClick={handlePrint}>Reprint Bill</Button>

    </div>
  );
}