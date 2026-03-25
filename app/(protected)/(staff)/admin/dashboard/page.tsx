'use client';

import { useEffect, useMemo, useState } from 'react';
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
          credentials: 'include',
        });

        if (!res.ok) return;

        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
      }
    };

    load();

    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, []);

  const overview = useMemo(() => {
    return {
      runningOrders:
        (data?.orders?.runningTableOrders || 0) +
        (data?.orders?.runningParcelOrders || 0),
      todayRevenue: data?.revenue?.todayRevenue || 0,
      pendingBills: data?.revenue?.pendingBills || 0,
      avgRating: data?.feedback?.avgRating || 0,
    };
  }, [data]);

  if (!data || !data.tables) {
    return (
      <div className="px-4 py-6 md:px-6">
        <div className="mx-auto max-w-6xl text-center text-gray-500">
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 py-4 sm:px-4 md:px-6 md:py-6">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* HEADER */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Monitor tables, orders, billing, staff, and feedback.
          </p>
        </div>

        {/* TOP SUMMARY */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatCard
            title="Running Orders"
            value={overview.runningOrders}
            subtitle="Active table + parcel orders"
            onClick={() => router.push('/admin/orders')}
          />

          <StatCard
            title="Pending Bills"
            value={overview.pendingBills}
            subtitle="Bills waiting for payment"
            onClick={() => router.push('/admin/bills?pending=true')}
          />
          <StatCard
            title="Today's Revenue"
            value={`₹${overview.todayRevenue}`}
            subtitle="Collected today"
            onClick={() => router.push('/admin/revenue')}
          />
        </div>

        {/* OPERATIONS */}
        <DashboardSection
          title="Operations"
          subtitle="Live operational status across tables, parcel, and kitchen"
        >
          <ClickableCard
            title="Free Tables"
            value={data.tables?.freeTables || 0}
            helper="Available for new customers"
            onClick={() => router.push('/counter/tables?status=free')}
          />

          <ClickableCard
            title="Occupied Tables"
            value={data.tables?.occupiedTables || 0}
            helper="Currently running dine-in orders"
            onClick={() => router.push('/counter/tables?status=occupied')}
          />

          <ClickableCard
            title="Parcel Status"
            value={`P-${data.parcel?.currentParcelNumber || 0} / D-${data.parcel?.lastDeliveredParcelNumber || 0}`}
            helper="Current and last delivered parcel"
            onClick={() => router.push('/counter/parcel')}
          />

          <ClickableCard
            title="Kitchen Pending"
            value={data.orders?.unservedItems || 0}
            helper="Items not yet served"
            onClick={() => router.push('/kitchen/orders?tab=pending')}
          />

          <ClickableCard
            title="Ready Items"
            value={data.orders?.readyItems || 0}
            helper="Prepared items waiting to serve"
            onClick={() => router.push('/kitchen/orders?tab=ready')}
          />

          <ClickableCard
            title="Active Staff"
            value={data.staff?.activeStaff || 0}
            helper="Currently active users"
            onClick={() => router.push('/admin/staff')}
          />
        </DashboardSection>

        {/* ORDER INSIGHTS */}
        <DashboardSection
          title="Order Insights"
          subtitle="Track order completion and cancellation flow"
        >
          <ClickableCard
            title="Completed Orders"
            value={data.orders?.completedOrders || 0}
            helper="Successfully completed orders"
            onClick={() => router.push('/admin/orders?orderType=completed')}
          />

          <ClickableCard
            title="Cancelled Orders"
            value={data.orders?.forceClosedOrders || 0}
            helper="Cancelled or force closed orders"
            onClick={() => router.push('/admin/orders?orderType=force_closed')}
          />
        </DashboardSection>

        {/* BILLING & FEEDBACK */}
        <DashboardSection
          title="Billing & Feedback"
          subtitle="Revenue tracking and customer satisfaction"
        >
          <ClickableCard
            title="Today's Bills"
            value={data.revenue?.todaysBills || 0}
            helper="Bills generated today"
            onClick={() => router.push('/admin/bills?today=true')}
          />

          <Card
            onClick={() => router.push('/admin/feedback')}
            variant="ghost"
            hover={false}
            className="p-5 border border-[#3b2a1a]/15 bg-transparent shadow-none cursor-pointer transition hover:-translate-y-1 hover:shadow-lg"
          >
            <p className="text-sm text-gray-500">Average Rating</p>

            <div className="mt-3 flex items-center gap-3">
              <StarRating rating={data.feedback?.avgRating || 0} />
              <span className="text-2xl md:text-3xl font-bold">
                {(data.feedback?.avgRating || 0).toFixed(1)}
              </span>
            </div>

            <p className="text-xs text-gray-500 mt-3">
              Overall customer feedback score
            </p>
          </Card>
        </DashboardSection>
      </div>
    </div>
  );
}

function DashboardSection({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg md:text-xl font-bold">{title}</h2>
        {subtitle ? (
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">{children}</div>
    </section>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  onClick,
}: {
  title: string;
  value: React.ReactNode;
  subtitle?: string;
  onClick: () => void;
}) {
  return (
    <Card
      onClick={onClick}
      variant="ghost"
      hover={false}
      className="p-4 md:p-5 border border-[#3b2a1a]/15 bg-transparent shadow-none cursor-pointer transition hover:-translate-y-1 hover:shadow-lg"
    >
      <p className="text-xs md:text-sm text-gray-500">{title}</p>
      <div className="text-2xl md:text-3xl font-bold mt-2">{value}</div>
      {subtitle ? (
        <p className="text-xs text-gray-500 mt-2">{subtitle}</p>
      ) : null}
    </Card>
  );
}

function ClickableCard({
  title,
  value,
  helper,
  onClick,
}: {
  title: string;
  value: React.ReactNode;
  helper?: string;
  onClick: () => void;
}) {
  return (
    <Card
      onClick={onClick}
      variant="ghost"
      hover={false}
      className="p-5 border border-[#3b2a1a]/15 bg-transparent shadow-none cursor-pointer transition hover:-translate-y-1 hover:shadow-lg"
    >
      <p className="text-sm text-gray-500">{title}</p>
      <div className="text-2xl md:text-3xl font-bold mt-2">{value}</div>
      {helper ? <p className="text-xs text-gray-500 mt-3">{helper}</p> : null}
    </Card>
  );
}
