'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { useNotification } from '@/app/components/notification';

interface Table {
  _id: string;
  tableNumber: number;
  status: 'free' | 'occupied';
  currentOrderId?: string | null;
}

export default function TablePage() {
  const params = useParams();
  const router = useRouter();
  const notification = useNotification();

  const tableId = params.tableId as string;

  const [table, setTable] = useState<Table | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const fetchTable = useCallback(
    async (showLoader = false) => {
      try {
        if (showLoader) setLoading(true);

        setError('');

        const res = await fetch(`/api/counter/tables/${tableId}`, {
          cache: 'no-store',
          credentials: 'include',
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          setTable(null);
          setError(data?.error || 'Failed to fetch table');
          return;
        }

        setTable(data);
      } catch (err) {
        console.error(err);
        setTable(null);
        setError('Failed to fetch table');
      } finally {
        setLoading(false);
      }
    },
    [tableId],
  );

  useEffect(() => {
    if (!tableId) return;

    fetchTable(true);

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible' && !processing) {
        fetchTable(false);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [tableId, fetchTable, processing]);

  const handleOpenOrder = async () => {
    if (!table || processing) return;

    setProcessing(true);

    try {
      if (table.status === 'occupied' && table.currentOrderId) {
        router.push(`/counter/orders/${table.currentOrderId}`);
        return;
      }

      const res = await fetch('/api/counter/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableId }),
        credentials: 'include',
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        notification.error(data?.error || 'Failed to open order');
        return;
      }

      const orderId = data?._id || data?.order?._id;

      if (!orderId) {
        notification.error('Order created but order id not found');
        return;
      }

      router.push(`/counter/orders/${orderId}`);
    } catch (err) {
      console.error(err);
      notification.error('Something went wrong while opening order');
    } finally {
      setProcessing(false);
    }
  };

  const isFree = useMemo(() => table?.status === 'free', [table]);

  if (loading) {
    return (
      <div className="px-4 py-6 md:px-6">
        <div className="mx-auto max-w-3xl text-center text-gray-500">
          Loading table...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-6 md:px-6">
        <div className="mx-auto max-w-3xl">
          <Card
            variant="ghost"
            hover={false}
            className="p-6 text-center border border-red-200 bg-transparent shadow-none"
          >
            <p className="text-red-600 font-medium">{error}</p>

            <Button
              type="button"
              variant="outline"
              className="mt-4"
              onClick={() => fetchTable(true)}
            >
              Retry
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  if (!table) {
    return (
      <div className="px-4 py-6 md:px-6">
        <div className="mx-auto max-w-3xl">
          <Card
            variant="ghost"
            hover={false}
            className="p-6 text-center border border-[#3b2a1a]/15 bg-transparent shadow-none"
          >
            <p className="text-gray-500">Table not found.</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 md:px-6">
      <div className="mx-auto max-w-3xl space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Table {table.tableNumber}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Open current order or start a new dine-in order.
            </p>
          </div>

          <Badge
            variant="outline"
            className={
              isFree
                ? 'border-green-600 text-green-700 bg-transparent'
                : 'border-red-600 text-red-700 bg-transparent'
            }
          >
            {isFree ? 'Free' : 'Occupied'}
          </Badge>
        </div>

        <Card
          variant="ghost"
          hover={false}
          className="p-5 md:p-6 space-y-5 border border-[#3b2a1a]/15 bg-transparent shadow-none"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div
              className={`rounded-xl border p-4 bg-transparent ${
                isFree ? 'border-green-200' : 'border-red-200'
              }`}
            >
              <p className="text-sm text-gray-500">Table Number</p>
              <p className="text-xl font-bold mt-1">{table.tableNumber}</p>
            </div>

            <div
              className={`rounded-xl border p-4 bg-transparent ${
                isFree ? 'border-green-200' : 'border-red-200'
              }`}
            >
              <p className="text-sm text-gray-500">Current Status</p>
              <p
                className={`text-xl font-bold mt-1 ${
                  isFree ? 'text-green-700' : 'text-red-700'
                }`}
              >
                {isFree ? 'Free' : 'Occupied'}
              </p>
            </div>
          </div>

          <Button
            type="button"
            onClick={handleOpenOrder}
            disabled={processing}
            className="w-full"
          >
            {processing
              ? 'Opening...'
              : isFree
                ? 'Start New Order'
                : 'View Current Order'}
          </Button>
        </Card>
      </div>
    </div>
  );
}
