'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';

interface Staff {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
}

export default function AdminStaffPage() {
  const router = useRouter();

  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  /* ================= FETCH (ONCE) ================= */

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const res = await fetch('/api/admin/staff', {
          cache: 'no-store',
        });

        const data = await res.json();

        setStaff(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, []);

  /* ================= OPTIMISTIC UPDATE ================= */

  const updateStatus = async (id: string, active: boolean) => {
    const confirmAction = window.confirm(
      active ? 'Activate this staff member?' : 'Deactivate this staff member?',
    );

    if (!confirmAction) return;

    /* ⚡ instant UI update */
    setStaff((prev) =>
      prev.map((s) =>
        s._id === id ? { ...s, isActive: active } : s
      )
    );

    try {
      await fetch(`/api/admin/staff/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: active }),
      });
    } catch (err) {
      console.error(err);

      /* ❌ rollback if failed */
      setStaff((prev) =>
        prev.map((s) =>
          s._id === id ? { ...s, isActive: !active } : s
        )
      );
    }
  };

  /* ================= FILTER (MEMO) ================= */

  const filtered = useMemo(() => {
    return staff.filter(
      (s) =>
        (!roleFilter || s.role === roleFilter) &&
        s.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [staff, search, roleFilter]);

  /* ================= ROLE COLOR ================= */

  const roleColor = (role: string) => {
    if (role === 'admin') return 'bg-purple-100 text-purple-700';
    if (role === 'counter') return 'bg-blue-100 text-blue-700';
    if (role === 'kitchen') return 'bg-yellow-100 text-yellow-700';

    return 'bg-gray-100 text-gray-600';
  };

  /* ================= UI ================= */

  if (loading) {
    return <div className="p-6 text-gray-500">Loading staff...</div>;
  }

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-5xl mx-auto">
      {/* HEADER */}

      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">
          Staff Management
        </h1>

        <Button onClick={() => router.push('/admin/staff/new')}>
          + Add Staff
        </Button>
      </div>

      {/* SEARCH + FILTER */}

      <div className="flex flex-col md:flex-row gap-3">

  {/* SEARCH */}
  <div>
    <label htmlFor="staff-search" className="sr-only">
      Search staff
    </label>
    <input
      id="staff-search"
      type="text"
      placeholder="🔍 Search staff..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="border rounded-lg px-4 py-2 text-sm w-full md:w-72"
    />
  </div>

  {/* ROLE FILTER */}
  <div>
    <label htmlFor="role-filter" className="sr-only">
      Filter by role
    </label>
    <select
      id="role-filter"
      value={roleFilter}
      onChange={(e) => setRoleFilter(e.target.value)}
      className="border rounded-lg px-3 py-2 text-sm w-full md:w-40"
    >
      <option value="">All Roles</option>
      <option value="admin">Admin</option>
      <option value="counter">Counter</option>
      <option value="kitchen">Kitchen</option>
    </select>
  </div>

</div>

      {/* COUNT */}

      <p className="text-sm text-gray-500">
        {filtered.length} staff members
      </p>

      {/* EMPTY */}

      {filtered.length === 0 && (
        <p className="text-gray-500">No staff members found</p>
      )}

      {/* LIST */}

      <div className="space-y-4">
        {filtered.map((user) => (
          <Card key={user._id} className="p-4">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">

              {/* INFO */}

              <div className="space-y-1">
                <p className="font-semibold">{user.name}</p>

                <p className="text-sm">{user.email}</p>

                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-xs px-2 py-1 rounded ${roleColor(user.role)}`}
                  >
                    {user.role}
                  </span>

                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      user.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {/* ACTIONS */}

              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() =>
                    router.push(`/admin/staff/${user._id}/edit`)
                  }
                >
                  Edit
                </Button>

                {user.isActive ? (
                  <Button
                    className="bg-red-600 text-white"
                    onClick={() =>
                      updateStatus(user._id, false)
                    }
                  >
                    Deactivate
                  </Button>
                ) : (
                  <Button
                    className="bg-green-600 text-white"
                    onClick={() =>
                      updateStatus(user._id, true)
                    }
                  >
                    Activate
                  </Button>
                )}
              </div>

            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}