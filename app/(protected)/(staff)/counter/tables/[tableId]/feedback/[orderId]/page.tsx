'use client';

import { Button } from '@/app/components/ui/button';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function FeedbackPage() {
  const params = useParams();
  const router = useRouter();

  const tableId = params.tableId as string;
  const orderId = params.orderId as string;

  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!orderId) return;

    setLoading(true);

    const res = await fetch('/api/counter/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId,
        rating,
        comment,
      }),
    });

    if (!res.ok) {
      console.error(await res.json());
      setLoading(false);
      return;
    }

    setLoading(false);

    router.push('/counter/tables');
  };

  const skipFeedback = async () => {
    if (!orderId) return;

    // still close order + free table
    await fetch('/api/counter/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId,
        rating: 5,
        comment: '',
      }),
    });

    router.push('/counter/tables');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Customer Feedback
        </h1>

        <div className="flex justify-center gap-3 mb-6 text-3xl cursor-pointer">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              onClick={() => setRating(star)}
              className={star <= rating ? 'text-yellow-500' : 'text-gray-300'}
            >
              ★
            </span>
          ))}
        </div>

        <textarea
          placeholder="Optional comment..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full border rounded-lg p-3 mb-6 resize-none"
          rows={4}
        />

        <div className="flex flex-col gap-3">
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-green-600 text-white py-2 rounded-lg font-semibold"
          >
            {loading ? 'Submitting...' : 'Submit Feedback'}
          </Button>

          <Button
            onClick={skipFeedback}
            className="bg-gray-200 py-2 rounded-lg"
          >
            Skip
          </Button>
        </div>
      </div>
    </div>
  );
}
