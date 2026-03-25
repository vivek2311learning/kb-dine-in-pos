'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { useNotification } from '@/app/components/notification';

interface Parcel {
  _id: string;
  parcelNumber: number;
}

export default function ParcelPage() {
  const router = useRouter();
  const notification = useNotification();

  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const fetchParcels = useCallback(async (showLoader = false) => {
    try {
      if (showLoader) setLoading(true);

      setError('');

      const res = await fetch('/api/counter/parcel', {
        cache: 'no-store',
        credentials: 'include',
      });

      const data = await res.json().catch(() => []);

      if (!res.ok) {
        setError(data?.error || 'Failed to load parcels');
        return;
      }

      setParcels((prev) => {
        const same =
          prev.length === data.length &&
          prev.every(
            (p, i) =>
              p._id === data[i]._id && p.parcelNumber === data[i].parcelNumber,
          );

        return same ? prev : data;
      });
    } catch (err) {
      console.error('fetchParcels error', err);
      setError('Failed to load parcels');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchParcels(true);

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchParcels(false);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchParcels]);

  const openParcel = (id: string) => {
    router.push(`/counter/orders/${id}`);
  };

  const createParcel = async () => {
    if (creating) return;

    setCreating(true);

    try {
      const res = await fetch('/api/counter/parcel/create', {
        method: 'POST',
        credentials: 'include',
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        notification.error(data?.error || 'Failed to create parcel order');
        return;
      }

      const orderId = data?._id;

      if (!orderId) {
        notification.error('Parcel created but order id not found');
        return;
      }

      router.push(`/counter/orders/${orderId}`);
    } catch (err) {
      console.error(err);
      notification.error('Something went wrong while creating parcel');
    } finally {
      window.setTimeout(() => setCreating(false), 700);
    }
  };

  const stats = useMemo(() => {
    return {
      total: parcels.length,
      nextParcel:
        parcels.length > 0
          ? Math.max(...parcels.map((p) => p.parcelNumber)) + 1
          : 1,
    };
  }, [parcels]);

  if (loading) {
    return (
      <div className="px-4 py-6 md:px-6">
        <div className="mx-auto max-w-7xl text-center text-gray-500">
          Loading parcels...
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 py-4 sm:px-4 md:px-6 md:py-6">
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Parcel Orders</h1>
            <p className="text-sm text-gray-500 mt-1">
              Open running parcel orders or create a new parcel.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              onClick={createParcel}
              disabled={creating}
            >
              {creating ? 'Creating...' : 'New Parcel'}
            </Button>

            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => router.push('/counter/parcel/ready')}
            >
              Ready Parcels
            </Button>

            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => router.push('/counter/tables')}
            >
              Tables
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          <Card
            variant="ghost"
            hover={false}
            className="p-3 md:p-4 text-center border border-[#3b2a1a]/15 bg-transparent shadow-none"
          >
            <p className="text-xs md:text-sm text-gray-500">Running Parcels</p>
            <p className="text-xl md:text-2xl font-bold mt-1">{stats.total}</p>
          </Card>

          <Card
            variant="ghost"
            hover={false}
            className="p-3 md:p-4 text-center border border-yellow-700/20 bg-transparent shadow-none"
          >
            <p className="text-xs md:text-sm text-gray-500">Next Parcel</p>
            <p className="text-xl md:text-2xl font-bold mt-1">
              P-{stats.nextParcel}
            </p>
          </Card>

          <Card
            variant="ghost"
            hover={false}
            className="p-3 md:p-4 text-center border border-green-700/20 bg-transparent shadow-none"
          >
            <p className="text-xs md:text-sm text-gray-500">Status</p>
            <p className="text-xl md:text-2xl font-bold mt-1">Running</p>
          </Card>
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
              onClick={() => fetchParcels(true)}
            >
              Retry
            </Button>
          </Card>
        ) : parcels.length === 0 ? (
          <Card
            variant="ghost"
            hover={false}
            className="p-8 text-center border border-[#3b2a1a]/15 bg-transparent shadow-none"
          >
            <p className="text-gray-500">No running parcel orders.</p>

            <Button
              type="button"
              className="mt-4"
              onClick={createParcel}
              disabled={creating}
            >
              {creating ? 'Creating...' : 'Create First Parcel'}
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {parcels.map((parcel) => (
              <Card
                key={parcel._id}
                hover={false}
                onClick={() => openParcel(parcel._id)}
                className="p-4 md:p-5 cursor-pointer text-center border border-yellow-300 bg-yellow-50/40 transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-lg md:text-xl font-bold">
                      P-{parcel.parcelNumber}
                    </h2>

                    <Badge
                      variant="outline"
                      className="text-xs px-2 py-1 rounded-md border-yellow-700 text-yellow-800 bg-transparent"
                    >
                      Running
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
