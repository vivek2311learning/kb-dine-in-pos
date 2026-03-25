'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/app/components/ui/card';
import StarRating from '@/app/components/ui/starRating';

interface Feedback {
  _id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  orderId?: {
    _id?: string;
    type?: 'dine-in' | 'parcel';
    parcelNumber?: number;
    tableId?: {
      tableNumber: number;
    };
  };
}

export default function AdminFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  const fetchFeedbacks = async () => {
    try {
      const res = await fetch(
        `/api/admin/feedback${filter ? `?rating=${filter}` : ''}`,
        {
          cache: 'no-store',
          credentials: 'include',
        },
      );

      const data = await res.json();
      setFeedbacks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setFeedbacks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchFeedbacks();
  }, [filter]);

  const getRatingTone = (rating: number) => {
    if (rating >= 4) {
      return 'border-green-200 text-green-700 bg-green-50/60';
    }

    if (rating === 3) {
      return 'border-yellow-200 text-yellow-700 bg-yellow-50/60';
    }

    return 'border-red-200 text-red-700 bg-red-50/60';
  };

  const getOrderLabel = (feedback: Feedback) => {
    if (feedback.orderId?.type === 'parcel') {
      return `Parcel #${feedback.orderId?.parcelNumber || '-'}`;
    }

    return `Table ${feedback.orderId?.tableId?.tableNumber || '-'}`;
  };

  return (
    <div className="px-3 py-4 sm:px-4 md:px-6 md:py-6">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* HEADER */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Customer Feedback</h1>
          <p className="text-sm text-gray-500 mt-1">
            Review customer ratings, comments, and order-linked feedback.
          </p>
        </div>

        {/* FILTER */}
        <Card
          variant="ghost"
          hover={false}
          className="p-4 border border-[#3b2a1a]/15 bg-transparent shadow-none"
        >
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[160px_1fr] md:items-end">
            <div>
              <label
                htmlFor="rating"
                className="block text-sm font-medium mb-2"
              >
                Rating Filter
              </label>

              <select
                value={filter}
                id="rating"
                onChange={(e) => setFilter(e.target.value)}
                className="w-full rounded-xl border border-[#3b2a1a]/15 bg-transparent px-3 py-2.5 outline-none"
              >
                <option value="">All Ratings</option>
                <option value="5">5 Star</option>
                <option value="4">4 Star</option>
                <option value="3">3 Star</option>
                <option value="2">2 Star</option>
                <option value="1">1 Star</option>
              </select>
            </div>

            <div className="text-sm text-gray-500">
              {filter
                ? `Showing feedback with rating ${filter} star`
                : 'Showing all customer feedback'}
            </div>
          </div>
        </Card>

        {/* LIST */}
        {loading ? (
          <Card
            variant="ghost"
            hover={false}
            className="p-8 text-center border border-[#3b2a1a]/15 bg-transparent shadow-none"
          >
            <p className="text-gray-500">Loading feedback...</p>
          </Card>
        ) : feedbacks.length === 0 ? (
          <Card
            variant="ghost"
            hover={false}
            className="p-8 text-center border border-[#3b2a1a]/15 bg-transparent shadow-none"
          >
            <p className="text-gray-500">No feedback found.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {feedbacks.map((f) => (
              <Card
                key={f._id}
                onClick={() => router.push(`/admin/feedback/${f._id}`)}
                variant="ghost"
                hover={false}
                className="p-5 border border-[#3b2a1a]/15 bg-transparent shadow-none cursor-pointer transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className={`inline-flex rounded-lg border px-3 py-1.5 ${getRatingTone(
                        f.rating,
                      )}`}
                    >
                      <StarRating rating={f.rating} />
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-medium">{getOrderLabel(f)}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(f.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-1">Comment</p>
                    <p className="text-sm leading-6 line-clamp-3">
                      {f.comment?.trim() || 'No comment provided.'}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
