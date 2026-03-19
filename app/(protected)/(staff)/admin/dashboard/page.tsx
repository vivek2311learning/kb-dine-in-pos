'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/app/components/ui/card';
import StarRating from '@/app/components/ui/starRating';

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/admin/analytic', {
          cache: 'no-store',
        });

        if (!res.ok) {
          console.error('API failed');
          return;
        }

        const text = await res.text();

        let parsed;
        try {
          parsed = JSON.parse(text);
        } catch {
          console.error('Invalid JSON response');
          return;
        }

        setData(parsed);
      } catch (err) {
        console.error(err);
      }
    };

    load();
  }, []);

  if (!data || !data.tables) {
    return (
      <div className="p-8 text-gray-500 text-center">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-10 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      {/* TABLES */}
      <DashboardSection title="Tables">
        <ClickableCard
          title="Total Tables"
          value={data.tables?.totalTables || 0}
          onClick={() => router.push('/counter/tables')}
        />

        <ClickableCard
          title="Free Tables"
          value={data.tables?.freeTables || 0}
          onClick={() => router.push('/counter/tables?status=free')}
        />

        <ClickableCard
          title="Occupied Tables"
          value={data.tables?.occupiedTables || 0}
          onClick={() => router.push('/counter/tables?status=occupied')}
        />
      </DashboardSection>

      {/* ORDERS */}
      <DashboardSection title="Orders">
        <ClickableCard
          title="Running Tables"
          value={data.orders?.runningOrders || 0}
          onClick={() => router.push('/admin/orders?status=running')}
        />

        <ClickableCard
          title="Running Parcels"
          value={data.orders?.runningParcels || 0}
          onClick={() => router.push('/counter/parcel')}
        />

        <ClickableCard
          title="Closed Orders"
          value={data.orders?.closedOrders || 0}
          onClick={() => router.push('/admin/orders?status=closed')}
        />

        <ClickableCard
          title="Kitchen Pending"
          value={data.orders?.unservedItems || 0}
          onClick={() => router.push('/kitchen/orders')}
        />

        <ClickableCard
          title="Ready Items"
          value={data.orders?.readyItems || 0}
          onClick={() => router.push('/kitchen/orders')}
        />
      </DashboardSection>

      {/* BILLING */}
      <DashboardSection title="Billing">
        <ClickableCard
          title="Pending Bills"
          value={data.revenue?.pendingBills || 0}
          onClick={() => router.push('/admin/bills?pending=true')}
        />

        <ClickableCard
          title="Today's Bills"
          value={data.revenue?.todaysBills || 0}
          onClick={() => router.push('/admin/bills?today=true')}
        />

        <ClickableCard
          title="Today's Revenue"
          value={`₹${data.revenue?.todayRevenue || 0}`}
          onClick={() => router.push('/admin/revenue')}
        />
      </DashboardSection>

      {/* STAFF */}
      <DashboardSection title="Staff">
        <ClickableCard
          title="Active Staff"
          value={data.staff?.activeStaff || 0}
          onClick={() => router.push('/admin/staff')}
        />
      </DashboardSection>

      {/* FEEDBACK */}
      <DashboardSection title="Feedback">
        <ClickableCard
          title="Average Rating"
          value={
            <div className="flex items-center justify-center gap-2">
              <StarRating rating={data.feedback?.avgRating || 0} />
              <span className="text-lg font-semibold">
                {(data.feedback?.avgRating || 0).toFixed(1)}
              </span>
            </div>
          }
          onClick={() => router.push('/admin/feedback')}
        />
      </DashboardSection>
    </div>
  );
}

/* SECTION */
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

/* CARD */
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
      className="p-6 text-center cursor-pointer transition hover:shadow-xl hover:scale-[1.02] active:scale-95"
    >
      <p className="text-sm text-gray-500">{title}</p>
      <div className="text-3xl font-bold mt-2">{value}</div>
    </Card>
  );
}