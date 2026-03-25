'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';

export default function AdminRevenuePage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState({
    from: '',
    to: '',
  });

  const [debounced, setDebounced] = useState(search);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(search);
    }, 300);

    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        setLoading(true);

        const query = new URLSearchParams();

        if (debounced.from) query.append('from', debounced.from);
        if (debounced.to) query.append('to', debounced.to);

        const res = await fetch(`/api/admin/revenue?${query.toString()}`, {
          cache: 'no-store',
          credentials: 'include',
        });

        const result = await res.json();

        setData(Array.isArray(result) ? result : []);
      } catch (err) {
        console.error(err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenue();
  }, [debounced]);

  const total = useMemo(() => {
    return data.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  }, [data]);

  const totalBills = data.length;

  const averageBillValue = useMemo(() => {
    if (!data.length) return 0;
    return Math.round(total / data.length);
  }, [data, total]);

  return (
    <div className="px-3 py-4 sm:px-4 md:px-6 md:py-6">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* HEADER */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Revenue</h1>
          <p className="text-sm text-gray-500 mt-1">
            Monitor collected revenue and review bill-wise totals.
          </p>
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
                Select date range to view revenue entries.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div>
                <label
                  htmlFor="from"
                  className="block text-sm font-medium mb-2"
                >
                  From Date
                </label>
                <input
                  id="from"
                  type="date"
                  value={search.from}
                  onChange={(e) =>
                    setSearch((s) => ({ ...s, from: e.target.value }))
                  }
                  className="w-full rounded-xl border border-[#3b2a1a]/15 bg-transparent px-3 py-2.5 outline-none"
                />
              </div>

              <div>
                <label htmlFor="to" className="block text-sm font-medium mb-2">
                  To Date
                </label>
                <input
                  id="to"
                  type="date"
                  value={search.to}
                  onChange={(e) =>
                    setSearch((s) => ({ ...s, to: e.target.value }))
                  }
                  className="w-full rounded-xl border border-[#3b2a1a]/15 bg-transparent px-3 py-2.5 outline-none"
                />
              </div>

              <div className="flex items-end">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    setSearch({
                      from: '',
                      to: '',
                    })
                  }
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* SUMMARY */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card
            variant="ghost"
            hover={false}
            className="p-4 md:p-5 border border-[#3b2a1a]/15 bg-transparent shadow-none"
          >
            <p className="text-xs md:text-sm text-gray-500">Total Revenue</p>
            <div className="text-2xl md:text-3xl font-bold mt-2">₹{total}</div>
            <p className="text-xs text-gray-500 mt-2">
              Sum of all displayed bills
            </p>
          </Card>

          <Card
            variant="ghost"
            hover={false}
            className="p-4 md:p-5 border border-[#3b2a1a]/15 bg-transparent shadow-none"
          >
            <p className="text-xs md:text-sm text-gray-500">Bills Count</p>
            <div className="text-2xl md:text-3xl font-bold mt-2">
              {totalBills}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Total bills in current range
            </p>
          </Card>

          <Card
            variant="ghost"
            hover={false}
            className="p-4 md:p-5 border border-[#3b2a1a]/15 bg-transparent shadow-none"
          >
            <p className="text-xs md:text-sm text-gray-500">
              Average Bill Value
            </p>
            <div className="text-2xl md:text-3xl font-bold mt-2">
              ₹{averageBillValue}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Average revenue per bill
            </p>
          </Card>
        </div>

        {/* BILLS LIST */}
        <Card
          variant="ghost"
          hover={false}
          className="p-4 md:p-5 border border-[#3b2a1a]/15 bg-transparent shadow-none"
        >
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold">Bills</h2>
              <p className="text-sm text-gray-500 mt-1">
                Bill-wise revenue entries for the selected range.
              </p>
            </div>

            {loading ? (
              <div className="py-8 text-center text-gray-500">
                Loading revenue...
              </div>
            ) : data.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                No revenue found.
              </div>
            ) : (
              <div className="space-y-3">
                {data.map((bill: any) => (
                  <div
                    key={bill._id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-[#3b2a1a]/10 px-4 py-3"
                  >
                    <div>
                      <p className="font-medium">Bill #{bill.billNumber}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {bill.printedAt
                          ? new Date(bill.printedAt).toLocaleString()
                          : '—'}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-gray-500">Amount</p>
                      <p className="text-base md:text-lg font-bold">
                        ₹{bill.totalAmount}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
