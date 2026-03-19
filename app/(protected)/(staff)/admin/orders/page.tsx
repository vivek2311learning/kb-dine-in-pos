'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card } from '@/app/components/ui/card';

export default function AdminOrdersPage() {
  const router = useRouter();
  const params = useSearchParams();

  const [orders, setOrders] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState({
    billNumber: '',
    startDate: '',
    endDate: '',
  });

  const [debounced, setDebounced] = useState(search);

  const limit = 9;

  /* 🔥 DEBOUNCE */
  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(search);
      setPage(1);
    }, 300);

    return () => clearTimeout(t);
  }, [search]);

  /* 🔥 FETCH */
  useEffect(() => {
    const load = async () => {
      try {
        const query = new URLSearchParams({
          page: String(page),
          limit: String(limit),
        });

        if (debounced.billNumber)
          query.append('billNumber', debounced.billNumber);
        if (debounced.startDate)
          query.append('startDate', debounced.startDate);
        if (debounced.endDate)
          query.append('endDate', debounced.endDate);

        const res = await fetch(`/api/admin/orders?${query}`, {
          cache: 'no-store',
        });

        const data = await res.json();

        setOrders(data.data || []);
        setTotal(data.total || 0);
      } catch (err) {
        console.error(err);
      }
    };

    load();
  }, [page, debounced]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">

      <h1 className="text-3xl font-bold">Closed Orders</h1>

      {/* 🔍 SEARCH */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

  {/* BILL NUMBER */}
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

  {/* START DATE */}
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

  {/* END DATE */}
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

      {/* LIST */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

        {orders.map((order) => (
          <Card
            key={order._id}
            onClick={() => router.push(`/admin/orders/${order._id}`)}
            className="p-4 cursor-pointer hover:shadow-lg transition"
          >
            <div className="flex justify-between">

              <div>
                <p className="font-semibold">
                  {order.tableNumber
                    ? `Table ${order.tableNumber}`
                    : `Parcel #${order.parcelNumber}`}
                </p>

                <p className="text-xs text-gray-500">
                  Bill #{order.billNumber}
                </p>

                <p className="text-xs text-gray-500">
                  {order.closedAt
                    ? new Date(order.closedAt).toLocaleString()
                    : '-'}
                </p>
              </div>

              <div className="text-right">
                <p className="font-bold text-lg">
                  ₹{order.totalAmount}
                </p>

                <p className="text-sm text-green-600">Paid</p>
              </div>

            </div>
          </Card>
        ))}

      </div>

      {/* PAGINATION */}

      {totalPages > 1 && (
        <div className="flex justify-center gap-4">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1 border rounded disabled:opacity-40"
          >
            Prev
          </button>

          <span>Page {page} / {totalPages}</span>

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