'use client';

import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { useNotification } from '@/app/components/notification';
import { useParams, useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

export default function FeedbackPage() {
  const params = useParams();
  const router = useRouter();
  const notification = useNotification();

  const orderId = params.orderId as string;
  const type = (params.type as string) || 'dine-in';

  const [rating, setRating] = useState<number>(0);
  const [hover, setHover] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const selectedRating = hover || rating;

  const ratingLabel = useMemo(() => {
    if (selectedRating === 1) return 'Very Poor';
    if (selectedRating === 2) return 'Poor';
    if (selectedRating === 3) return 'Okay';
    if (selectedRating === 4) return 'Good';
    if (selectedRating === 5) return 'Excellent';
    return 'Tap to rate';
  }, [selectedRating]);

  const goBackToList = () => {
    router.push(type === 'parcel' ? '/counter/parcel' : '/counter/tables');
  };

  const submitFeedback = async (payload: {
    rating: number;
    comment: string;
  }) => {
    const res = await fetch('/api/counter/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        orderId,
        rating: payload.rating,
        comment: payload.comment,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data?.error || 'Feedback submit failed');
    }

    return data;
  };

  const handleSubmit = async () => {
    if (!orderId) return;

    try {
      setLoading(true);

      await submitFeedback({
        rating,
        comment: comment.trim(),
      });

      goBackToList();
    } catch (err: any) {
      console.error('Feedback submit error:', err);
      notification.error(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const skipFeedback = async () => {
    if (!orderId || loading) return;

    try {
      setLoading(true);

      await submitFeedback({
        rating: 5,
        comment: '',
      });

      goBackToList();
    } catch (err: any) {
      console.error('Skip feedback error:', err);
      notification.error(err.message || 'Something went wrong');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-6 md:px-6 md:py-10">
      <div className="mx-auto max-w-xl">
        <Card
          variant="ghost"
          hover={false}
          className="border border-[#3b2a1a]/15 bg-transparent shadow-none rounded-3xl p-6 md:p-8"
        >
          <div className="space-y-6">
            {/* HEADER */}
            <div className="text-center space-y-3">
              <Badge variant="outline" className="bg-transparent">
                Feedback
              </Badge>

              <div>
                <h1 className="text-2xl md:text-3xl font-bold">
                  How was your experience?
                </h1>

                <p className="text-sm text-gray-500 mt-2">
                  Your feedback helps us improve service quality and speed.
                </p>
              </div>
            </div>

            {/* STAR RATING */}
            <div className="rounded-2xl border border-[#3b2a1a]/10 p-5 text-center space-y-4">
              <div className="flex justify-center gap-2 sm:gap-3 text-4xl md:text-5xl">
                {[1, 2, 3, 4, 5].map((star) => {
                  const active = star <= selectedRating;

                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHover(star)}
                      onMouseLeave={() => setHover(0)}
                      className={`transition-transform duration-150 hover:scale-110 ${
                        active ? 'text-yellow-500' : 'text-gray-200'
                      }`}
                      aria-label={`Rate ${star} star`}
                    >
                      ★
                    </button>
                  );
                })}
              </div>

              <p className="text-sm font-medium text-[#3b2a1a]">
                {ratingLabel}
              </p>
            </div>

            {/* COMMENT */}
            <div className="space-y-2">
              <label
                htmlFor="comment"
                className="block text-sm font-medium text-[#3b2a1a]"
              >
                Comment <span className="text-gray-500">(optional)</span>
              </label>

              <textarea
                id="comment"
                placeholder="Tell us what you liked or how we can improve..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="w-full rounded-2xl border border-[#3b2a1a]/15 bg-transparent px-4 py-3 resize-none outline-none transition focus:border-[#3b2a1a]/30"
              />

              <p className="text-xs text-gray-500">
                Keep it short and practical.
              </p>
            </div>

            {/* ACTIONS */}
            <div className="space-y-3">
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Submitting...' : 'Submit Feedback'}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={skipFeedback}
                disabled={loading}
                className="w-full"
              >
                Skip for Now
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
