'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';

interface OverviewData {
  totalBills: number;
  totalRevenue: number;
  refundCount: number;
  refundAmount: number;
  wastageCount: number;
  wastageValue: number;
}

export default function AdminReportsPage() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchOverview = async () => {
    setLoading(true);

    let url = '/api/admin/reports/overview';

    if (from && to) {
      url += `?from=${from}&to=${to}`;
    }

    const res = await fetch(url);
    const result = await res.json();

    setData(result);
    setLoading(false);
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  /* ================= INSIGHTS ================= */

  const [insights, setInsights] = useState<any>(null);

  const fetchInsights = async () => {
    const res = await fetch('/api/admin/reports/insights');
    const data = await res.json();
    setInsights(data);
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">Reports Overview</h1>

      {/* ================= DATE FILTER ================= */}

      <Card className="p-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label htmlFor="from-date" className="block text-sm mb-1">
              From Date
            </label>
            <input
              id="from-date"
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="border p-2 rounded"
            />
          </div>

          <div>
            <label htmlFor="to-date" className="block text-sm mb-1">
              To Date
            </label>
            <input
              id="to-date"
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="border p-2 rounded"
            />
          </div>

          <Button onClick={fetchOverview}>
            {loading ? 'Loading...' : 'Apply Filter'}
          </Button>
        </div>
      </Card>

      {/* ================= OVERVIEW CARDS ================= */}

      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6 text-center">
            <p className="text-sm text-gray-500">Total Bills</p>
            <p className="text-2xl font-bold mt-2">{data.totalBills}</p>
          </Card>

          <Card className="p-6 text-center">
            <p className="text-sm text-gray-500">Total Revenue</p>
            <p className="text-2xl font-bold mt-2">₹{data.totalRevenue}</p>
          </Card>

          <Card className="p-6 text-center">
            <p className="text-sm text-gray-500">Refund Count</p>
            <p className="text-2xl font-bold mt-2">{data.refundCount}</p>
          </Card>

          <Card className="p-6 text-center">
            <p className="text-sm text-gray-500">Refund Amount</p>
            <p className="text-2xl font-bold mt-2">₹{data.refundAmount}</p>
          </Card>

          <Card className="p-6 text-center">
            <p className="text-sm text-gray-500">Wastage Items</p>
            <p className="text-2xl font-bold mt-2">{data.wastageCount}</p>
          </Card>

          <Card className="p-6 text-center">
            <p className="text-sm text-gray-500">Wastage Value</p>
            <p className="text-2xl font-bold mt-2">₹{data.wastageValue}</p>
          </Card>
        </div>
      )}

      {insights && (
        <div className="space-y-8">
          {/* TOP ITEMS */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              Top 4 Most Sold Items
            </h2>

            {insights.topItems.map((item: any, i: number) => (
              <div key={i} className="flex justify-between border-b py-2">
                <span>{item._id}</span>
                <span>{item.totalSold} sold</span>
              </div>
            ))}
          </Card>

          {/* TOP REVENUE DAYS */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Top Revenue Days</h2>

            {insights.revenueDays.map((day: any, i: number) => (
              <div key={i} className="flex justify-between border-b py-2">
                <span>{day._id}</span>
                <span>₹{day.totalRevenue}</span>
              </div>
            ))}
          </Card>
        </div>
      )}
    </div>
  );
}
