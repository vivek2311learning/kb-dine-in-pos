'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';

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
          credentials: 'include',
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
        <span className="text-xs px-2 py-1 rounded-md border border-red-700 text-red-700 bg-transparent">
          Refunded
        </span>
      );
    }

    if (bill.isPaid) {
      return (
        <span className="text-xs px-2 py-1 rounded-md border border-green-700 text-green-700 bg-transparent">
          Paid
        </span>
      );
    }

    return (
      <span className="text-xs px-2 py-1 rounded-md border border-yellow-700 text-yellow-800 bg-transparent">
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
    <div className="px-3 py-4 sm:px-4 md:px-6 md:py-6">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* HEADER */}
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>
            <p className="text-sm text-gray-500 mt-1">
              Track unpaid, paid, refunded, and daily bills.
            </p>
          </div>

          <Card
            variant="ghost"
            hover={false}
            className="p-3 border border-[#3b2a1a]/15 bg-transparent shadow-none"
          >
            <p className="text-xs text-gray-500">Total Records</p>
            <p className="text-xl font-bold mt-1">{total}</p>
          </Card>
        </div>

        {/* FILTERS */}
        <Card
          variant="ghost"
          hover={false}
          className="p-4 border border-[#3b2a1a]/15 bg-transparent shadow-none"
        >
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold">Filters</h2>
              <p className="text-sm text-gray-500 mt-1">
                Search by bill number and date range.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
              <div>
                <label
                  htmlFor="billNumber"
                  className="block text-sm font-medium mb-2"
                >
                  Bill Number
                </label>

                <input
                  id="billNumber"
                  placeholder="Enter bill no"
                  value={search.billNumber}
                  onChange={(e) =>
                    setSearch((s) => ({ ...s, billNumber: e.target.value }))
                  }
                  className="w-full rounded-xl border border-[#3b2a1a]/15 bg-transparent px-3 py-2.5 outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="startDate"
                  className="block text-sm font-medium mb-2"
                >
                  Start Date
                </label>

                <input
                  id="startDate"
                  type="date"
                  value={search.startDate}
                  onChange={(e) =>
                    setSearch((s) => ({ ...s, startDate: e.target.value }))
                  }
                  className="w-full rounded-xl border border-[#3b2a1a]/15 bg-transparent px-3 py-2.5 outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="endDate"
                  className="block text-sm font-medium mb-2"
                >
                  End Date
                </label>

                <input
                  id="endDate"
                  type="date"
                  value={search.endDate}
                  onChange={(e) =>
                    setSearch((s) => ({ ...s, endDate: e.target.value }))
                  }
                  className="w-full rounded-xl border border-[#3b2a1a]/15 bg-transparent px-3 py-2.5 outline-none"
                />
              </div>

              <div className="flex items-end">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setSearch({
                      billNumber: '',
                      startDate: '',
                      endDate: '',
                    });
                    setPage(1);
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* CONTENT */}
        {loading ? (
          <div className="text-center text-gray-500 py-10">
            Loading bills...
          </div>
        ) : bills.length === 0 ? (
          <Card
            variant="ghost"
            hover={false}
            className="p-8 text-center border border-[#3b2a1a]/15 bg-transparent shadow-none"
          >
            <p className="text-gray-500">No bills found.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {bills.map((bill) => (
              <Card
                key={bill._id}
                onClick={() => router.push(`/admin/bills/${bill._id}`)}
                variant="ghost"
                hover={false}
                className="p-4 border border-[#3b2a1a]/15 bg-transparent shadow-none cursor-pointer transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-base">
                        Bill #{bill.billNumber}
                      </p>

                      <p className="text-xs text-gray-500 mt-1">
                        {bill.printedAt
                          ? new Date(bill.printedAt).toLocaleString()
                          : '—'}
                      </p>
                    </div>

                    {statusBadge(bill)}
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between gap-3">
                      <span className="text-gray-500">Amount</span>
                      <span className="font-semibold text-base">
                        ₹{bill.totalAmount}
                      </span>
                    </div>

                    <div className="flex justify-between gap-3">
                      <span className="text-gray-500">Payment</span>
                      <span className="font-medium">
                        {bill.isRefunded
                          ? 'Refunded'
                          : bill.isPaid
                            ? 'Completed'
                            : 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Prev
            </Button>

            <Card
              variant="ghost"
              hover={false}
              className="px-4 py-2 border border-[#3b2a1a]/15 bg-transparent shadow-none"
            >
              <span className="text-sm font-medium">
                Page {page} / {totalPages}
              </span>
            </Card>

            <Button
              type="button"
              variant="outline"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
