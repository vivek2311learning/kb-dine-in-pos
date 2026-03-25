'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { useNotification } from '@/app/components/notification';

interface Parcel {
  _id: string;
  parcelNumber: number;
}

export default function ReadyParcels() {
  const router = useRouter();
  const notification = useNotification();

  const [orders, setOrders] = useState<Parcel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReady = useCallback(async (showLoader = false) => {
    try {
      if (showLoader) {
        setLoading(true);
      }

      setError('');

      const res = await fetch('/api/counter/parcel/ready', {
        cache: 'no-store',
        credentials: 'include',
      });

      const data = await res.json().catch(() => []);

      if (!res.ok) {
        setError(data?.error || 'Failed to load ready parcels');
        return;
      }

      setOrders((prev) => {
        const same =
          prev.length === data.length &&
          prev.every(
            (p, i) =>
              p._id === data[i]._id && p.parcelNumber === data[i].parcelNumber,
          );

        return same ? prev : data;
      });
    } catch (err) {
      console.error(err);
      setError('Failed to load ready parcels');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReady(true);

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchReady(false);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchReady]);

  const openParcel = (id: string) => {
    router.push(`/counter/orders/${id}`);
  };

  if (loading) {
    return (
      <div className="px-4 py-6 md:px-6">
        <div className="mx-auto max-w-6xl text-center text-gray-500">
          Loading ready parcels...
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 md:px-6 md:py-6">
      <div className="mx-auto max-w-6xl space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Ready Parcels</h1>
            <p className="text-sm text-gray-500 mt-1">
              Parcels ready for counter handover.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push('/counter/parcel')}
            className="whitespace-nowrap"
          >
            All Parcels
          </Button>
        </div>

        {error ? (
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
              onClick={() => {
                notification.info('Retrying ready parcels');
                fetchReady(true);
              }}
            >
              Retry
            </Button>
          </Card>
        ) : orders.length === 0 ? (
          <Card
            variant="ghost"
            hover={false}
            className="p-8 text-center border border-[#3b2a1a]/15 bg-transparent shadow-none"
          >
            <p className="text-gray-500">No ready parcels right now.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {orders.map((order) => (
              <Card
                key={order._id}
                hover={false}
                className="p-4 md:p-5 border border-green-300 bg-green-50/40 transition-all duration-200 cursor-pointer hover:shadow-lg hover:-translate-y-1"
                onClick={() => openParcel(order._id)}
              >
                <div className="flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h2 className="text-lg md:text-xl font-bold leading-tight">
                        P-{order.parcelNumber}
                      </h2>
                      <p className="text-xs md:text-sm text-gray-600 mt-1">
                        Ready for delivery
                      </p>
                    </div>

                    <Badge
                      variant="outline"
                      className="text-xs px-2 py-1 rounded-md border-green-600 text-green-700 bg-transparent"
                    >
                      Ready
                    </Badge>
                  </div>

                  <Button type="button" size="sm" className="w-full">
                    Open Parcel
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
