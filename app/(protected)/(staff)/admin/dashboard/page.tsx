'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/app/components/ui/card';
import StarRating from '@/app/components/ui/starRating';

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/admin/analytic', { cache: 'no-store' })
      .then((res) => res.json())
      .then(setData)
      .catch(console.error);
  }, []);

  if (!data) {
    return <div className="p-8 text-gray-500">Loading dashboard...</div>;
  }

  return (
    <div className="p-6 md:p-8 space-y-10 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      {/* ================= TABLE SECTION ================= */}

      <DashboardSection title="Tables">
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
      </DashboardSection>

      {/* ================= ORDER SECTION ================= */}

      <DashboardSection title="Orders">
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
      </DashboardSection>

      {/* ================= REVENUE SECTION ================= */}

      <DashboardSection title="Revenue">
        <ClickableCard
          title="Today's Revenue"
          value={`₹${data.revenue.todayRevenue}`}
          onClick={() => router.push('/admin/revenue')}
        />

        <ClickableCard
          title="Today's Bills"
          value={data.revenue.todaysBills}
          onClick={() => router.push('/admin/bills?today=true')}
        />

        <ClickableCard
          title="Average Rating"
          value={
            <span className="text-2xl font-bold mt-2  flex items-center justify-center">
              <StarRating rating={data.feedback.avgRating} />
              <span>{data.feedback.avgRating.toFixed(1)}</span>
            </span>
          }
          onClick={() => router.push('/admin/feedback')}
        />
      </DashboardSection>
    </div>
  );
}

/* ================= SECTION COMPONENT ================= */

function DashboardSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">{title}</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {children}
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
  value: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Card
      onClick={onClick}
      className="p-6 text-center cursor-pointer hover:shadow-lg transition border hover:border-black/20"
    >
      <p className="text-sm text-gray-500">{title}</p>

      <p className="text-3xl font-bold mt-2">{value}</p>
    </Card>
  );
}
