'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/app/components/ui/card';
import StarRating from '@/app/components/ui/starRating'

interface Feedback {
  _id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  orderId?: {
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
        { cache: 'no-store' },
      );

      const data = await res.json();

      setFeedbacks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchFeedbacks();
  }, [filter]);

  const ratingColor = (rating: number) => {
    if (rating >= 4) return 'bg-green-100 text-green-700';

    if (rating === 3) return 'bg-yellow-100 text-yellow-700';

    return 'bg-red-100 text-red-700';
  };

 

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Customer Feedback</h1>

      <div className="flex gap-3 items-center">
        <span className="text-sm font-medium">Filter</span>
        <label htmlFor="rating">Rating</label>
        <select
          value={filter}
          id="rating"
          onChange={(e) => setFilter(e.target.value)}
          className="border rounded p-2"
        >
          <option value="">All</option>
          <option value="5">5 ⭐</option>
          <option value="4">4 ⭐</option>
          <option value="3">3 ⭐</option>
          <option value="2">2 ⭐</option>
          <option value="1">1 ⭐</option>
        </select>
      </div>

      {loading && <p className="text-gray-500">Loading feedback...</p>}

      {!loading && feedbacks.length === 0 && (
        <p className="text-red-500">No feedback found</p>
      )}

      <div className="space-y-3">
        {feedbacks.map((f) => (
          <Card
            key={f._id}
            onClick={() => router.push(`/admin/feedback/${f._id}`)}
            className="p-4 cursor-pointer hover:shadow-md transition"
          >
            <div className="flex justify-between items-center">
              <span
                className={`px-2 py-1 rounded text-sm ${ratingColor(f.rating)}`}
              >
                <StarRating rating={f.rating} />
              </span>

              <span className="text-sm ">
                Table {f.orderId?.tableId?.tableNumber || '-'}
              </span>
            </div>

            <p className="text-sm  mt-2 line-clamp-2">
              {f.comment || 'No comment'}
            </p>

            <p className="text-xs  mt-2">
              {new Date(f.createdAt).toLocaleString()}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
