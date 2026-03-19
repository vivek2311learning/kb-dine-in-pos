'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/app/components/ui/card';
import StarRating from '@/app/components/ui/starRating';
import { useRouter } from 'next/navigation';

export default function AdminReportsPage() {
  const [data, setData] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/admin/analytic', {
          cache: 'no-store',
        });

        if (!res.ok) return;

        const text = await res.text();

        let parsed;
        try {
          parsed = JSON.parse(text);
        } catch {
          console.error('Invalid JSON');
          return;
        }

        setData(parsed);
      } catch (err) {
        console.error(err);
      }
    };

    load();
  }, []);

  if (!data) {
    return <div className="p-6 text-gray-500">Loading reports...</div>;
  }

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold">Reports &amp; Analytics</h1>

      {/* SUMMARY */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <p>Today's Revenue</p>
          <p className="text-2xl font-bold">₹{data.revenue?.todayRevenue || 0}</p>
        </Card>

        <Card className="p-4 text-center">
          <p>Today&apos;s Bills</p>
          <p className="text-2xl font-bold">{data.revenue?.todaysBills || 0}</p>
        </Card>

        <Card className="p-4 text-center">
          <p>Total Feedback</p>
          <p className="text-2xl font-bold">
            {data.feedback?.totalFeedback || 0}
          </p>
        </Card>

        <Card className="p-4 text-center">
          <p>Average Rating</p>
          <div className="flex justify-center gap-2">
            <StarRating rating={data.feedback?.avgRating || 0} />
            <span>{(data.feedback?.avgRating || 0).toFixed(1)}</span>
          </div>
        </Card>
      </div>

      {/* TOP ITEMS */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Top Selling Items</h2>

        {(data?.insights?.topItems || []).map((item: any, i: number) => (
          <div key={i} className="flex justify-between border-b py-2">
            <span>{item._id}</span>
            <span>{item.totalSold} sold</span>
          </div>
        ))}
      </Card>

      {/* WASTAGE */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Wastage</h2>

        <div className="flex gap-8">
          <div>
            <p>Items</p>
            <p>{data?.insights?.wastageItems || 0}</p>
          </div>

          <div>
            <p>Value</p>
            <p>₹{data?.insights?.wastageValue || 0}</p>
          </div>
        </div>
      </Card>

      {/* FEEDBACK DISTRIBUTION */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Rating Distribution</h2>

        {Object.entries(data.feedback?.ratingCounts || {}).map(
          ([rating, count]) => (
            <div key={rating} className="flex justify-between border-b py-2">
              <span>{rating} ⭐</span>
              <span>{count as number}</span>
            </div>
          ),
        )}
      </Card>
    </div>
  );
}