/* =========================
1) ADMIN ORDERS PAGE
========================= */
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';

export default function AdminOrdersPage() {
  const router = useRouter();
  const params = useSearchParams();

  const type = params.get('type');
  const status = params.get('status');
  const orderType = params.get('orderType');

  const [orders, setOrders] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState({
    startDate: '',
    endDate: '',
  });

  const [debounced, setDebounced] = useState(search);

  const limit = 9;

  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(search);
      setPage(1);
    }, 300);

    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const query = new URLSearchParams({
          page: String(page),
          limit: String(limit),
        });

        if (type) query.append('type', type);
        if (status) query.append('status', status);
        if (orderType) query.append('orderType', orderType);

        if (debounced.startDate) {
          query.append('startDate', debounced.startDate);
        }

        if (debounced.endDate) {
          query.append('endDate', debounced.endDate);
        }

        const res = await fetch(`/api/admin/orders?${query}`, {
          cache: 'no-store',
          credentials: 'include',
        });

        const data = await res.json();

        setOrders(data.data || []);
        setTotal(data.total || 0);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [page, debounced, type, status, orderType]);

  const totalPages = Math.ceil(total / limit);

  const getTitle = () => {
    if (orderType === 'completed') return 'Completed Orders';
    if (orderType === 'cancelled') return 'Cancelled Orders';
    if (orderType === 'force_closed') return 'Waste Orders';

    if (type === 'parcel') return 'Running Parcels';
    if (type === 'dine-in') return 'Running Table Orders';

    return 'Orders';
  };

  const getStatusClass = (reason: string | null, orderStatus: string) => {
    if (orderStatus === 'running') {
      return 'border-blue-700 text-blue-700 bg-transparent';
    }

    if (reason === 'completed') {
      return 'border-green-700 text-green-700 bg-transparent';
    }

    if (reason === 'cancelled') {
      return 'border-red-700 text-red-700 bg-transparent';
    }

    if (reason === 'force_closed') {
      return 'border-orange-700 text-orange-700 bg-transparent';
    }

    return 'border-[#3b2a1a]/20 text-gray-600 bg-transparent';
  };

  const getStatusLabel = (reason: string | null, orderStatus: string) => {
    if (orderStatus === 'running') return 'Running';
    if (reason === 'completed') return 'Completed';
    if (reason === 'cancelled') return 'Cancelled';
    if (reason === 'force_closed') return 'Waste';
    return 'Closed';
  };

  const handleOrderClick = (order: any) => {
    if (order.status === 'running') {
      router.push(`/counter/orders/${order._id}`);
      return;
    }

    router.push(`/admin/orders/${order._id}`);
  };

  return (
    <div className="px-3 py-4 sm:px-4 md:px-6 md:py-6">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* HEADER */}
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{getTitle()}</h1>
            <p className="text-sm text-gray-500 mt-1">
              Track running, completed, cancelled, and waste orders.
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
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-lg font-bold">Filters</h2>
              <p className="text-sm text-gray-500 mt-1">
                Filter orders by date range.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
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
                    setSearch({ startDate: '', endDate: '' });
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
            Loading orders...
          </div>
        ) : orders.length === 0 ? (
          <Card
            variant="ghost"
            hover={false}
            className="p-8 text-center border border-[#3b2a1a]/15 bg-transparent shadow-none"
          >
            <p className="text-gray-500">No orders found.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {orders.map((order) => (
              <Card
                key={order._id}
                onClick={() => handleOrderClick(order)}
                variant="ghost"
                hover={false}
                className="p-4 border border-[#3b2a1a]/15 bg-transparent shadow-none cursor-pointer transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-base">
                        {order.tableNumber
                          ? `Table ${order.tableNumber}`
                          : `Parcel #${order.parcelNumber}`}
                      </p>

                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(order.openedAt).toLocaleString()}
                      </p>
                    </div>

                    <span
                      className={`text-xs px-2 py-1 rounded-md border ${getStatusClass(
                        order.closedReason,
                        order.status,
                      )}`}
                    >
                      {getStatusLabel(order.closedReason, order.status)}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between gap-3">
                      <span className="text-gray-500">Order Type</span>
                      <span className="font-medium capitalize">
                        {order.orderType || order.type || '-'}
                      </span>
                    </div>

                    <div className="flex justify-between gap-3">
                      <span className="text-gray-500">Status</span>
                      <span className="font-medium capitalize">
                        {order.status || '-'}
                      </span>
                    </div>

                    {order.closedReason ? (
                      <div className="flex justify-between gap-3">
                        <span className="text-gray-500">Closed Reason</span>
                        <span className="font-medium capitalize">
                          {order.closedReason.replace('_', ' ')}
                        </span>
                      </div>
                    ) : null}
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
