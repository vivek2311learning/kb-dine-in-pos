'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card } from '@/app/components/ui/card';

export default function AdminOrdersPage() {
  const router = useRouter();
  const params = useSearchParams();

  const type = params.get('type');
  const status = params.get('status');
  const orderType = params.get('orderType');

  const [orders, setOrders] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

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
        });

        const data = await res.json();

        setOrders(data.data || []);
        setTotal(data.total || 0);
      } catch (err) {
        console.error(err);
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

  const getStatusColor = (reason: string | null, orderStatus: string) => {
    if (orderStatus === 'running') return 'text-blue-600';
    if (reason === 'completed') return 'text-green-600';
    if (reason === 'cancelled') return 'text-red-600';
    if (reason === 'force_closed') return 'text-orange-600';
    return 'text-gray-500';
  };

  const getStatusLabel = (reason: string | null, orderStatus: string) => {
    if (orderStatus === 'running') return 'Running';
    if (reason === 'completed') return 'Completed';
    if (reason === 'cancelled') return 'Cancelled';
    if (reason === 'force_closed') return 'Force Closed';
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
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">{getTitle()}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {orders.map((order) => (
          <Card
            key={order._id}
            onClick={() => handleOrderClick(order)}
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
                  {new Date(order.openedAt).toLocaleString()}
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs text-gray-500">{order.orderType}</p>

                <p
                  className={`text-sm font-semibold ${getStatusColor(
                    order.closedReason,
                    order.status,
                  )}`}
                >
                  {getStatusLabel(order.closedReason, order.status)}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-4">
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
