'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/app/components/ui/card';

interface Bill {
  _id: string;
  billNumber: number;
  totalAmount: number;
  isPaid: boolean;
  isRefunded: boolean;
  printedAt: string;
}

export default function AdminBillsPage() {
  const router = useRouter();
  const params = useSearchParams();

  const pending = params.get('pending');
  const today = params.get('today');

  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const limit = 9;

  const [search, setSearch] = useState({
    billNumber: '',
    startDate: '',
    endDate: '',
  });

  const [debounced, setDebounced] = useState(search);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(search);
      setPage(1);
    }, 300);

    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    const fetchBills = async () => {
      try {
        setLoading(true);

        const query = new URLSearchParams({
          page: String(page),
          limit: String(limit),
        });

        if (pending === 'true') query.append('pending', 'true');
        if (today === 'true') query.append('today', 'true');

        if (debounced.billNumber) {
          query.append('billNumber', debounced.billNumber);
        }

        if (debounced.startDate) {
          query.append('startDate', debounced.startDate);
        }

        if (debounced.endDate) {
          query.append('endDate', debounced.endDate);
        }

        const res = await fetch(`/api/admin/bills?${query}`, {
          cache: 'no-store',
        });

        const data = await res.json();

        setBills(data.data || []);
        setTotal(data.total || 0);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBills();
  }, [page, debounced, pending, today]);

  const totalPages = Math.ceil(total / limit);

  const statusBadge = (bill: Bill) => {
    if (bill.isRefunded) {
      return (
        <span className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded">
          Refunded
        </span>
      );
    }

    if (bill.isPaid) {
      return (
        <span className="text-xs px-2 py-1 bg-green-100 text-green-600 rounded">
          Paid
        </span>
      );
    }

    return (
      <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-600 rounded">
        Unpaid
      </span>
    );
  };

  const title =
    pending === 'true'
      ? 'Pending Bills'
      : today === 'true'
        ? "Today's Bills"
        : 'Bills';

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">{title}</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label htmlFor="billNumber" className="sr-only">
            Bill Number
          </label>

          <input
            id="billNumber"
            placeholder="Bill No"
            value={search.billNumber}
            onChange={(e) =>
              setSearch((s) => ({ ...s, billNumber: e.target.value }))
            }
            className="border p-2 rounded w-full"
          />
        </div>

        <div>
          <label htmlFor="startDate" className="sr-only">
            Start Date
          </label>

          <input
            id="startDate"
            type="date"
            value={search.startDate}
            onChange={(e) =>
              setSearch((s) => ({ ...s, startDate: e.target.value }))
            }
            className="border p-2 rounded w-full"
          />
        </div>

        <div>
          <label htmlFor="endDate" className="sr-only">
            End Date
          </label>

          <input
            id="endDate"
            type="date"
            value={search.endDate}
            onChange={(e) =>
              setSearch((s) => ({ ...s, endDate: e.target.value }))
            }
            className="border p-2 rounded w-full"
          />
        </div>
      </div>

      {loading && <p className="text-gray-500">Loading...</p>}

      {!loading && bills.length === 0 && (
        <p className="text-center text-red-500 py-10">No bills found</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {bills.map((bill) => (
          <Card
            key={bill._id}
            onClick={() => router.push(`/admin/bills/${bill._id}`)}
            className="p-4 cursor-pointer hover:shadow-lg transition"
          >
            <div className="flex justify-between">
              <div>
                <p className="font-semibold">Bill #{bill.billNumber}</p>

                <p className="text-xs text-gray-500">
                  {bill.printedAt
                    ? new Date(bill.printedAt).toLocaleString()
                    : '—'}
                </p>
              </div>

              {statusBadge(bill)}
            </div>

            <div className="mt-3 text-lg font-bold">₹{bill.totalAmount}</div>
          </Card>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1 border rounded disabled:opacity-40"
          >
            Prev
          </button>

          <span>
            Page {page} / {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 border rounded disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
