'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card } from '@/app/components/ui/card';
import StarRating from '@/app/components/ui/starRating';

export default function FeedbackDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [feedback, setFeedback] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const res = await fetch(`/api/admin/feedback/${id}`);

        const data = await res.json();

        setFeedback(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchFeedback();
  }, [id]);

  const ratingColor = (rating: number) => {
    if (rating >= 4) return 'bg-green-100 text-green-700';

    if (rating === 3) return 'bg-yellow-100 text-yellow-700';

    return 'bg-red-100 text-red-700';
  };

  if (loading)
    return <div className="p-6 text-gray-500">Loading feedback...</div>;

  if (!feedback)
    return <div className="p-6 text-gray-500">Feedback not found</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Feedback Detail</h1>

      <Card className="p-4 flex justify-between items-center">
        <h2 className="font-semibold">Rating</h2>

        <span className={`px-3 py-1 rounded ${ratingColor(feedback.rating)}`}>
          <StarRating rating={feedback.rating} />
        </span>
      </Card>

      <Card className="p-4 space-y-2">
        <h2 className="font-semibold">Customer Comment</h2>

        <p className="text-sm">{feedback.comment || 'No comment provided'}</p>
      </Card>

      <Card className="p-4 space-y-2">
        <h2 className="font-semibold">Order Information</h2>

        <p>Table: {feedback.orderId?.tableId?.tableNumber || '-'}</p>

        <p>Order ID: {feedback.orderId?._id || '-'}</p>

        <p>Bill Number: {feedback.billNumber || '-'}</p>

        <p>
          Bill Amount: {feedback.billAmount ? `₹${feedback.billAmount}` : '-'}
        </p>

        <p>
          Date:{' '}
          {feedback.createdAt
            ? new Date(feedback.createdAt).toLocaleString()
            : '-'}
        </p>
      </Card>
    </div>
  );
}
