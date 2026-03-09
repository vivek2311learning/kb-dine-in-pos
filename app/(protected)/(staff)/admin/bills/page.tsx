'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';

interface Bill {
  _id: string;
  billNumber: number;
  totalAmount: number;
  isPaid: boolean;
  isRefunded: boolean;
  printedAt: string;
  orderId: any;
}

export default function AdminBillsPage() {
  const router = useRouter();

  const [bills, setBills] = useState<Bill[]>([]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const fetchBills = async () => {
    let url = '/api/admin/bills';

    if (from && to) {
      url += `?from=${from}&to=${to}`;
    }

    const res = await fetch(url);
    const data = await res.json();
    setBills(data);
  };

  useEffect(() => {
    fetchBills();
  }, []);

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">Bills</h1>

      {/* FILTER */}
      <div className="flex gap-4 items-end">
        <div>
          <label htmlFor="from-date" className="text-sm block mb-1">
            From Date
          </label>

          <input
            id="from-date"
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="border p-2 rounded"
          />
        </div>

        <div>
          <label htmlFor="to-date" className="text-sm block mb-1">
            To Date
          </label>

          <input
            id="to-date"
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="border p-2 rounded"
          />
        </div>

        <Button onClick={fetchBills}>Filter</Button>
      </div>

      {/* LIST */}
      <div className="space-y-3">
        {bills.map((bill) => (
          <Card
            key={bill._id}
            className="p-4 cursor-pointer hover:shadow-md transition"
            onClick={() => router.push(`/admin/bills/${bill._id}`)}
          >
            <div className="flex justify-between">
              <div>
                <p className="font-semibold">Bill #{bill.billNumber}</p>
                <p className="text-sm text-gray-500">
                  {new Date(bill.printedAt).toLocaleString()}
                </p>
              </div>

              <div className="text-right">
                <p className="font-bold">₹{bill.totalAmount}</p>

                <p className="text-sm">
                  {bill.isRefunded
                    ? 'Refunded'
                    : bill.isPaid
                      ? 'Paid'
                      : 'Unpaid'}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
