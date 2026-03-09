'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>('');

  const router = useRouter();

  const fetchFeedbacks = async () => {
    const res = await fetch(
      `/api/admin/feedback${filter ? `?rating=${filter}` : ''}`,
    );

    const data = await res.json();
    setFeedbacks(data);
  };

  useEffect(() => {
    fetchFeedbacks();
  }, [filter]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Customer Feedback</h1>

      {/* FILTER */}
      <div>
        <label htmlFor="rating-filter" className="block mb-1">
          Filter by Rating
        </label>

        <select
          id="rating-filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All</option>
          <option value="5">5 ⭐</option>
          <option value="4">4 ⭐</option>
          <option value="3">3 ⭐</option>
          <option value="2">2 ⭐</option>
          <option value="1">1 ⭐</option>
        </select>
      </div>

      {/* LIST */}
      <div className="space-y-3">
        {feedbacks.map((f) => (
          <div
            key={f._id}
            className="border p-4 rounded cursor-pointer hover:bg-gray-50"
            onClick={() => router.push(`/admin/feedback/${f._id}`)}
          >
            <div className="flex justify-between">
              <span>⭐ {f.rating}</span>
              <span>Table {f.orderId?.tableId?.tableNumber}</span>
            </div>

            <p className="text-sm mt-2 text-gray-600">
              {f.comment || 'No comment'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
