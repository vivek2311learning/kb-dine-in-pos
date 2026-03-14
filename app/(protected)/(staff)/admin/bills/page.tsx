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
  const [loading, setLoading] = useState(true);

  const fetchBills = async () => {

    try {

      let url = '/api/admin/bills';

      if (from && to) {
        url += `?from=${from}&to=${to}`;
      }

      const res = await fetch(url, { cache: 'no-store' });

      const data = await res.json();

      setBills(data);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }

  };

  useEffect(() => {
    fetchBills();
  }, []);

  /* ---------------- STATUS BADGE ---------------- */

  const statusBadge = (bill: Bill) => {

    if (bill.isRefunded) {
      return (
        <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-600">
          Refunded
        </span>
      );
    }

    if (bill.isPaid) {
      return (
        <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-600">
          Paid
        </span>
      );
    }

    return (
      <span className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-600">
        Unpaid
      </span>
    );

  };

  /* ---------------- UI ---------------- */

  return (

    <div className="p-4 md:p-8 space-y-6 max-w-6xl mx-auto">

      <h1 className="text-3xl font-bold">
        Bills
      </h1>

      {/* FILTER */}

      <Card className="p-4">

        <div className="flex flex-col md:flex-row gap-4 md:items-end">

          <div>

            <label htmlFor="from-date" className="text-sm block mb-1">
              From Date
            </label>

            <input
              id="from-date"
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="border p-2 rounded w-full"
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
              className="border p-2 rounded w-full"
            />

          </div>

          <Button onClick={fetchBills}>
            Filter
          </Button>

        </div>

      </Card>


      {/* LIST */}

      {loading && (
        <p className="text-gray-500">
          Loading bills...
        </p>
      )}

      {!loading && bills.length === 0 && (
        <p className="text-red-500 text-center py-10">
          No bills found
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

        {bills.map((bill) => (

          <Card
            key={bill._id}
            className="p-4 cursor-pointer hover:shadow-lg transition"
            onClick={() => router.push(`/admin/bills/${bill._id}`)}
          >

            <div className="flex justify-between items-center">

              <div>

                <p className="font-semibold">
                  Bill #{bill.billNumber}
                </p>

                <p className="text-xs ">
                  {new Date(bill.printedAt).toLocaleString()}
                </p>

              </div>

              {statusBadge(bill)}

            </div>

            <div className="mt-3 text-lg font-bold">
              ₹{bill.totalAmount}
            </div>

          </Card>

        ))}

      </div>

    </div>

  );

}