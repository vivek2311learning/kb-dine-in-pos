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

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const res = await fetch('/api/admin/staff', { cache: 'no-store' });
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

  const updateStatus = async (id: string, active: boolean) => {
    if (!confirm(active ? 'Activate staff?' : 'Deactivate staff?')) return;

    setStaff((prev) =>
      prev.map((s) => (s._id === id ? { ...s, isActive: active } : s)),
    );

    try {
      await fetch(`/api/admin/staff/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: active }),
      });
    } catch {
      setStaff((prev) =>
        prev.map((s) => (s._id === id ? { ...s, isActive: !active } : s)),
      );
    }
  };

  const filtered = useMemo(() => {
    return staff.filter(
      (s) =>
        (!roleFilter || s.role === roleFilter) &&
        s.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [staff, search, roleFilter]);

  const roleColor = (role: string) => {
    if (role === 'admin') return 'bg-purple-100 text-purple-700';
    if (role === 'counter') return 'bg-blue-100 text-blue-700';
    if (role === 'kitchen') return 'bg-yellow-100 text-yellow-700';
    return 'bg-gray-100 text-gray-600';
  };

  if (loading) {
    return <div className="p-6 text-gray-500">Loading staff...</div>;
  }

  return (
    <div className="px-4 py-6 md:px-6 md:py-8 max-w-5xl mx-auto space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Staff Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage staff accounts and roles
          </p>
        </div>

        <Button onClick={() => router.push('/admin/staff/new')}>
          + Add Staff
        </Button>
      </div>

      {/* FILTER BAR */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* SEARCH */}
        <div className="w-full sm:w-72">
          <label htmlFor="staff-search" className="sr-only">
            Search staff
          </label>

          <input
            id="staff-search"
            type="text"
            placeholder="Search staff..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-[#3b2a1a]/15 px-3 py-2.5"
          />
        </div>

        {/* ROLE FILTER */}
        <div className="w-full sm:w-48">
          <label htmlFor="role-filter" className="sr-only">
            Filter by role
          </label>

          <select
            id="role-filter"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full rounded-xl border border-[#3b2a1a]/15 px-3 py-2.5"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="counter">Counter</option>
            <option value="kitchen">Kitchen</option>
          </select>
        </div>
      </div>

      {/* COUNT */}
      <p className="text-sm text-gray-500">{filtered.length} staff members</p>

      {/* LIST */}
      <div className="space-y-4">
        {filtered.map((user) => (
          <Card
            variant="ghost"
            hover={false}
            key={user._id}
            className="p-4 border border-[#3b2a1a]/15 bg-transparent shadow-none"
          >
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              {/* INFO */}
              <div>
                <p className="font-semibold text-lg">{user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>

                <div className="flex gap-2 mt-2 flex-wrap">
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

              {/* ACTION */}
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  onClick={() => router.push(`/admin/staff/${user._id}/edit`)}
                >
                  Edit
                </Button>

                {user.isActive ? (
                  <Button
                    className="bg-red-600"
                    onClick={() => updateStatus(user._id, false)}
                  >
                    Deactivate
                  </Button>
                ) : (
                  <Button
                    className="bg-green-600"
                    onClick={() => updateStatus(user._id, true)}
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
