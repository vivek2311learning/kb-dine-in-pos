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
        const res = await fetch(`/api/admin/feedback/${id}`, {
          cache: 'no-store',
          credentials: 'include',
        });

        const data = await res.json();
        setFeedback(data);
      } catch (err) {
        console.error(err);
        setFeedback(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchFeedback();
  }, [id]);

  const getRatingTone = (rating: number) => {
    if (rating >= 4) {
      return 'border-green-200 text-green-700 bg-green-50/60';
    }

    if (rating === 3) {
      return 'border-yellow-200 text-yellow-700 bg-yellow-50/60';
    }

    return 'border-red-200 text-red-700 bg-red-50/60';
  };

  const getOrderLabel = () => {
    if (feedback?.orderId?.type === 'parcel') {
      return `Parcel #${feedback?.orderId?.parcelNumber || '-'}`;
    }

    return `Table ${feedback?.orderId?.tableId?.tableNumber || '-'}`;
  };

  if (loading) {
    return (
      <div className="px-4 py-6 md:px-6">
        <div className="mx-auto max-w-4xl text-center text-gray-500">
          Loading feedback...
        </div>
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="px-4 py-6 md:px-6">
        <div className="mx-auto max-w-4xl">
          <Card
            variant="ghost"
            hover={false}
            className="p-6 text-center border border-[#3b2a1a]/15 bg-transparent shadow-none"
          >
            <p className="text-gray-500">Feedback not found.</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 py-4 sm:px-4 md:px-6 md:py-6">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* HEADER */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Feedback Detail</h1>
          <p className="text-sm text-gray-500 mt-1">
            Review detailed customer feedback linked to the order and bill.
          </p>
        </div>

        {/* RATING */}
        <Card
          variant="ghost"
          hover={false}
          className="p-5 border border-[#3b2a1a]/15 bg-transparent shadow-none"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-500">Rating</p>
              <h2 className="text-lg font-bold mt-1">Customer Score</h2>
            </div>

            <div
              className={`inline-flex w-fit rounded-xl border px-4 py-2 ${getRatingTone(
                feedback.rating,
              )}`}
            >
              <StarRating rating={feedback.rating} />
            </div>
          </div>
        </Card>

        {/* COMMENT */}
        <Card
          variant="ghost"
          hover={false}
          className="p-5 border border-[#3b2a1a]/15 bg-transparent shadow-none"
        >
          <div className="space-y-3">
            <div>
              <h2 className="text-lg font-bold">Customer Comment</h2>
              <p className="text-sm text-gray-500 mt-1">
                Written feedback shared by the customer.
              </p>
            </div>

            <div className="rounded-xl border border-[#3b2a1a]/10 p-4">
              <p className="text-sm leading-6">
                {feedback.comment?.trim() || 'No comment provided.'}
              </p>
            </div>
          </div>
        </Card>

        {/* ORDER INFO */}
        <Card
          variant="ghost"
          hover={false}
          className="p-5 border border-[#3b2a1a]/15 bg-transparent shadow-none"
        >
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold">Order Information</h2>
              <p className="text-sm text-gray-500 mt-1">
                Linked order and bill details for this feedback.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <InfoRow label="Order Label" value={getOrderLabel()} />
              <InfoRow label="Order ID" value={feedback.orderId?._id || '-'} />
              <InfoRow label="Bill Number" value={feedback.billNumber || '-'} />
              <InfoRow
                label="Bill Amount"
                value={
                  feedback.billAmount != null ? `₹${feedback.billAmount}` : '-'
                }
              />
              <InfoRow
                label="Date"
                value={
                  feedback.createdAt
                    ? new Date(feedback.createdAt).toLocaleString()
                    : '-'
                }
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[#3b2a1a]/10 p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-medium mt-1 break-words">{value}</p>
    </div>
  );
}
