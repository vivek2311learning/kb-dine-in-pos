'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/app/components/ui/card';

export default function AdminRevenuePage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState({
    from: '',
    to: '',
  });

  const [debounced, setDebounced] = useState(search);

  /* 🔥 DEBOUNCE */
  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(search);
    }, 300);

    return () => clearTimeout(t);
  }, [search]);

  /* 🔥 FETCH */
  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        setLoading(true);

        const query = new URLSearchParams();

        if (debounced.from) query.append('from', debounced.from);
        if (debounced.to) query.append('to', debounced.to);

        const res = await fetch(`/api/admin/revenue?${query.toString()}`, {
          cache: 'no-store',
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

  /* 🔥 TOTAL (MEMO) */
  const total = useMemo(() => {
    return data.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  }, [data]);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold">Revenue</h1>

      {/* 🔍 FILTER */}

      <Card className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="from" className="sr-only">From</label>
          <input
            id="from"
            type="date"
            value={search.from}
            onChange={(e) =>
              setSearch((s) => ({ ...s, from: e.target.value }))
            }
            className="border p-2 rounded w-full"
          />
        </div>

        <div>
          <label htmlFor="to" className="sr-only">To</label>
          <input
            id="to"
            type="date"
            value={search.to}
            onChange={(e) =>
              setSearch((s) => ({ ...s, to: e.target.value }))
            }
            className="border p-2 rounded w-full"
          />
        </div>
      </Card>

      {/* TOTAL */}

      <Card className="p-6 text-center">
        <p className="text-sm text-gray-500">Total Revenue</p>
        <p className="text-3xl font-bold mt-2">₹{total}</p>
      </Card>

      {/* LIST */}

      <Card className="p-6 space-y-3">
        <h2 className="font-semibold">Bills</h2>

        {loading && <p className="text-gray-500">Loading...</p>}

        {!loading && data.length === 0 && (
          <p className="text-red-500 text-center py-6">
            No revenue found
          </p>
        )}

        {data.map((bill: any) => (
          <div
            key={bill._id}
            className="flex justify-between border-b py-2 text-sm"
          >
            <span>Bill #{bill.billNumber}</span>
            <span>₹{bill.totalAmount}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}