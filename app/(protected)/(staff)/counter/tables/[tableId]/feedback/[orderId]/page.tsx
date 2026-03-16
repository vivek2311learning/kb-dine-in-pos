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
  const [hover, setHover] = useState<number>(0);

  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  /* ---------------- SUBMIT ---------------- */

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

    router.push('/counter/tables');
  };

  /* ---------------- SKIP ---------------- */

  const skipFeedback = async () => {
    if (!orderId) return;

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

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="border shadow-xl rounded-2xl p-8 w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">How was your experience?</h1>

          <p className="text-sm text-gray-500 mt-1">
            Your feedback helps us improve
          </p>
        </div>

        {/* STAR RATING */}

        <div className="flex justify-center gap-3 text-4xl">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              className={`cursor-pointer transition ${
                star <= (hover || rating) ? 'text-yellow-500' : 'text-gray-100'
              }`}
            >
              ★
            </span>
          ))}
        </div>

        {/* COMMENT */}

        <div>
          <label htmlFor="comment" className="block text-sm font-medium mb-2">
            Comment (optional)
          </label>

          <textarea
            id="comment"
            placeholder="Tell us what you liked or how we can improve..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full border rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
            rows={4}
          />
        </div>

        {/* ACTIONS */}

        <div className="flex flex-col gap-3">
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition"
          >
            {loading ? 'Submitting...' : 'Submit Feedback'}
          </Button>

          <button
            onClick={skipFeedback}
            className="text-sm text-gray-500 hover:underline"
          >
            Skip feedback
          </button>
        </div>
      </div>
    </div>
  );
}
