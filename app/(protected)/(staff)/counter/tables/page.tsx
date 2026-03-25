'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { useNotification } from '@/app/components/notification';

interface Table {
  _id: string;
  tableNumber: number;
  status: 'free' | 'occupied';
  currentOrderId?: string | null;
}

type TableStatusFilter = 'all' | 'free' | 'occupied';

export default function TablesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const notification = useNotification();

  const initialStatus =
    (searchParams.get('status') as TableStatusFilter) || 'all';

  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] =
    useState<TableStatusFilter>(initialStatus);

  const fetchTables = useCallback(async (showLoader = false) => {
    try {
      if (showLoader) setLoading(true);

      setError('');

      const res = await fetch('/api/counter/tables', {
        cache: 'no-store',
        credentials: 'include',
      });

      const data = await res.json().catch(() => []);

      if (!res.ok) {
        setError(data?.error || 'Failed to load tables');
        return;
      }

      setTables((prev) => {
        const same =
          prev.length === data.length &&
          prev.every(
            (t, i) =>
              t._id === data[i]._id &&
              t.tableNumber === data[i].tableNumber &&
              t.status === data[i].status &&
              t.currentOrderId === data[i].currentOrderId,
          );

        return same ? prev : data;
      });
    } catch (err) {
      console.error(err);
      setError('Failed to load tables');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTables(true);

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible' && !processingId) {
        fetchTables(false);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchTables, processingId]);

  const filteredTables = useMemo(() => {
    if (statusFilter === 'all') return tables;
    return tables.filter((table) => table.status === statusFilter);
  }, [tables, statusFilter]);

  const stats = useMemo(() => {
    const free = tables.filter((t) => t.status === 'free').length;
    const occupied = tables.filter((t) => t.status === 'occupied').length;

    return {
      total: tables.length,
      free,
      occupied,
    };
  }, [tables]);

  const handleClick = async (table: Table) => {
    if (processingId === table._id) return;

    setProcessingId(table._id);

    try {
      if (table.status === 'free') {
        const res = await fetch('/api/counter/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tableId: table._id }),
          credentials: 'include',
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          notification.error(data?.error || 'Failed to create order');
          return;
        }

        const orderId = data?._id || data?.order?._id;

        if (!orderId) {
          notification.error('Order created but order id not found');
          return;
        }

        router.push(`/counter/orders/${orderId}`);
        return;
      }

      if (table.currentOrderId) {
        router.push(`/counter/orders/${table.currentOrderId}`);
        return;
      }

      notification.warning(
        'This table is occupied but no running order was found',
      );

      await fetchTables(false);
    } catch (err) {
      console.error(err);
      notification.error('Something went wrong while opening table');
    } finally {
      window.setTimeout(() => {
        setProcessingId(null);
      }, 700);
    }
  };

  if (loading) {
    return (
      <div className="px-4 py-6 md:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-center text-gray-500">Loading tables...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 py-4 sm:px-4 md:px-6 md:py-6">
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Tables</h1>
            <p className="text-sm text-gray-500 mt-1">
              Open running orders or start a new dine-in order.
            </p>
          </div>

          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => router.push('/counter/parcel')}
              className="whitespace-nowrap"
            >
              Parcel
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Card
            variant="wood"
            hover={false}
            className="p-3 md:p-4 text-center border border-[#3b2a1a]/15 bg-transparent shadow-none"
          >
            <p className="text-xs md:text-sm text-gray-500">Total</p>
            <p className="text-xl md:text-2xl font-bold mt-1">{stats.total}</p>
          </Card>

          <Card
            variant="wood"
            hover={false}
            className="p-3 md:p-4 text-center border border-green-500/20 bg-transparent shadow-none"
          >
            <p className="text-xs md:text-sm text-gray-500">Free</p>
            <p className="text-xl md:text-2xl font-bold mt-1">{stats.free}</p>
          </Card>

          <Card
            variant="wood"
            hover={false}
            className="p-3 md:p-4 text-center border border-red-500/20 bg-transparent shadow-none"
          >
            <p className="text-xs md:text-sm text-gray-500">Occupied</p>
            <p className="text-xl md:text-2xl font-bold mt-1">
              {stats.occupied}
            </p>
          </Card>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant={statusFilter === 'all' ? 'primary' : 'ghost'}
            onClick={() => setStatusFilter('all')}
            className={
              statusFilter === 'all'
                ? ''
                : 'bg-transparent border border-[#3b2a1a]/20 text-[#3b2a1a]'
            }
          >
            All
          </Button>

          <Button
            type="button"
            size="sm"
            variant={statusFilter === 'free' ? 'primary' : 'ghost'}
            onClick={() => setStatusFilter('free')}
            className={
              statusFilter === 'free'
                ? ''
                : 'bg-transparent border border-[#3b2a1a]/20 text-[#3b2a1a]'
            }
          >
            Free
          </Button>

          <Button
            type="button"
            size="sm"
            variant={statusFilter === 'occupied' ? 'primary' : 'ghost'}
            onClick={() => setStatusFilter('occupied')}
            className={
              statusFilter === 'occupied'
                ? ''
                : 'bg-transparent border border-[#3b2a1a]/20 text-[#3b2a1a]'
            }
          >
            Occupied
          </Button>
        </div>

        {error ? (
          <Card
            variant="outline"
            hover={false}
            className="p-6 text-center bg-transparent"
          >
            <p className="text-red-600 font-medium">{error}</p>

            <Button
              type="button"
              variant="outline"
              className="mt-4"
              onClick={() => fetchTables(true)}
            >
              Retry
            </Button>
          </Card>
        ) : filteredTables.length === 0 ? (
          <Card
            variant="outline"
            hover={false}
            className="p-8 text-center bg-transparent"
          >
            <p className="text-gray-500">No tables found for this filter.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {filteredTables.map((table) => {
              const isProcessing = processingId === table._id;
              const isFree = table.status === 'free';

              return (
                <Card
                  key={table._id}
                  onClick={() => handleClick(table)}
                  hover={false}
                  className={`
                    p-4 md:p-5
                    border
                    transition-all duration-200
                    ${
                      isProcessing
                        ? 'opacity-60 pointer-events-none'
                        : 'cursor-pointer hover:shadow-lg hover:-translate-y-1'
                    }
                    ${
                      isFree
                        ? 'border-green-300 bg-green-50/50'
                        : 'border-red-300 bg-red-50/50'
                    }
                  `}
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h2 className="text-lg md:text-xl font-bold leading-tight">
                          T-{table.tableNumber}
                        </h2>
                        <p className="text-xs md:text-sm text-gray-600 mt-1">
                          {isFree ? 'Ready for order' : 'Order running'}
                        </p>
                      </div>

                      <Badge
                        variant="outline"
                        className={`text-xs px-2 py-1 rounded-md ${
                          isFree
                            ? 'border-green-600 text-green-700 bg-transparent'
                            : 'border-red-600 text-red-700 bg-transparent'
                        }`}
                      >
                        {isFree ? 'Free' : 'Occupied'}
                      </Badge>
                    </div>

                    <Button
                      type="button"
                      size="sm"
                      className="w-full text-sm"
                      disabled={isProcessing}
                    >
                      {isProcessing
                        ? 'Opening...'
                        : isFree
                          ? 'Start Order'
                          : 'View Order'}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
