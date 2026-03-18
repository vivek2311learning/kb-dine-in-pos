'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/app/components/ui/card';
import StarRating from '@/app/components/ui/starRating';
import { useRouter } from 'next/navigation';

interface Analytics {
  feedback: any;
  revenue: any;
  tables: any;
  orders: any;
  insights: any;
}

export default function AdminReportsPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/admin/analytic', { cache: 'no-store' })
      .then((res) => res.json())
      .then(setData)
      .catch(console.error);
  }, []);

  if (!data) {
    return <div className="p-6 text-gray-500">Loading reports...</div>;
  }

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold">Reports &amp; Analytics</h1>

      {/* ================= REVENUE SUMMARY ================= */}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card
          className="p-4 text-center"
          onClick={() => router.push('/admin/revenue')}
        >
          <p className="text-sm text-gray-500">Today&apos;s Revenue</p>
          <p className="text-2xl font-bold mt-2">
            ₹{data.revenue.todayRevenue}
          </p>
        </Card>

        <Card
          className="p-4 text-center"
          onClick={() => router.push('/admin/bills?today=true')}
        >
          <p className="text-sm text-gray-500">Today&apos;s Bills</p>
          <p className="text-2xl font-bold mt-2">{data.revenue.todaysBills}</p>
        </Card>

        <Card
          className="p-4 text-center"
          onClick={() => router.push('/admin/feedback')}
        >
          <p className="text-sm text-gray-500">Total Feedback</p>
          <p className="text-2xl font-bold mt-2">
            {data.feedback.totalFeedback}
          </p>
        </Card>

        <Card className="p-4 text-center">
          <p className="text-sm text-gray-500">Average Rating</p>

          <span className="text-2xl font-bold mt-2 flex items-center justify-center gap-2">
            <StarRating rating={data.feedback.avgRating} />
            <p>{data.feedback.avgRating.toFixed(1)}</p>
          </span>
        </Card>
      </div>

      {/* ================= TOP ITEMS ================= */}

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Top Selling Items</h2>

        {data.insights.topItems.map((item: any, i: number) => (
          <div key={i} className="flex justify-between border-b py-2">
            <span>{item._id}</span>
            <span>{item.totalSold} sold</span>
          </div>
        ))}
      </Card>

      {/* ================= WASTAGE ================= */}

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Wastage Analytics</h2>

        <div className="flex gap-8">
          <div>
            <p className="text-sm text-gray-500">Items Wasted</p>
            <p className="text-lg font-semibold">
              {data.insights.wastageItems}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Wastage Value</p>
            <p className="text-lg font-semibold">
              ₹{data.insights.wastageValue}
            </p>
          </div>
        </div>
      </Card>

      {/* ================= FEEDBACK DISTRIBUTION ================= */}

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Rating Distribution</h2>

        {Object.entries(data.feedback.ratingCounts).map(([rating, count]) => (
          <div key={rating} className="flex justify-between border-b py-2">
            <span>{rating} ⭐</span>
            <span>{count as number}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}
