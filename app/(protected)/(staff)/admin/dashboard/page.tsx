'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/app/components/ui/card';

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/admin/analytic')
      .then((res) => res.json())
      .then(setData);
  }, []);

  if (!data) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-8 space-y-12">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      {/* ================= TABLE SECTION ================= */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Tables</h2>

        <div className="grid grid-cols-3 gap-6">
          <ClickableCard
            title="Total Tables"
            value={data.tables.totalTables}
            onClick={() => router.push('/counter/tables')}
          />

          <ClickableCard
            title="Free Tables"
            value={data.tables.freeTables}
            onClick={() => router.push('/counter/tables?status=free')}
          />

          <ClickableCard
            title="Occupied Tables"
            value={data.tables.occupiedTables}
            onClick={() => router.push('/counter/tables?status=occupied')}
          />
        </div>
      </div>

      {/* ================= ORDER SECTION ================= */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Orders</h2>

        <div className="grid grid-cols-3 gap-6">
          <ClickableCard
            title="Running Orders"
            value={data.orders.runningOrders}
            onClick={() => router.push('/admin/orders?status=running')}
          />

          <ClickableCard
            title="Closed Orders"
            value={data.orders.closedOrders}
            onClick={() => router.push('/admin/orders?status=closed')}
          />

          <ClickableCard
            title="Unserved Items"
            value={data.orders.unservedItems}
            onClick={() => router.push('/kitchen/orders')}
          />
        </div>
      </div>

      {/* ================= REVENUE SECTION ================= */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Revenue</h2>

        <div className="grid grid-cols-3 gap-6">
          <ClickableCard
            title="Today's Revenue"
            value={`₹${data.revenue.todayRevenue}`}
            onClick={() => router.push('/admin/bills?today=true')}
          />

          <ClickableCard
            title="Today's Bills"
            value={data.revenue.todaysBills}
            onClick={() => router.push('/admin/bills?today=true')}
          />

          <ClickableCard
            title="Average Rating"
            value={data.feedback.avgRating}
            onClick={() => router.push('/admin/feedback')}
          />
        </div>
      </div>
    </div>
  );
}

/* ================= CARD COMPONENT ================= */

function ClickableCard({
  title,
  value,
  onClick,
}: {
  title: string;
  value: number | string;
  onClick: () => void;
}) {
  return (
    <Card
      className="p-6 text-center cursor-pointer hover:shadow-md transition"
      onClick={onClick}
    >
      <p className="text-sm opacity-70">{title}</p>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </Card>
  );
}
