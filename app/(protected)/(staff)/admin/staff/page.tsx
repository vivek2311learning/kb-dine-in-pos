'use client';

import { useEffect, useState } from 'react';
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

  const fetchStaff = async () => {
    const res = await fetch('/api/admin/staff');
    const data = await res.json();
    setStaff(data);
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  // const deactivate = async (id: string) => {
  //   const confirmDelete = window.confirm('Deactivate this staff member?');
  //   if (!confirmDelete) return;

  //   await fetch(`/api/admin/staff/${id}`, {
  //     method: 'DELETE',
  //   });

  //   fetchStaff();
  // };

  const updateStatus = async (id: string, active: boolean) => {
    await fetch(`/api/admin/staff/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: active }),
    });

    fetchStaff();
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Staff Management</h1>

        <Button onClick={() => router.push('/admin/staff/new')}>
          + Add Staff
        </Button>
      </div>

      <div className="space-y-4">
        {staff.map((user) => (
          <Card key={user._id} className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
                <p className="text-xs mt-1">Role: {user.role}</p>
                <p
                  className={`text-xs mt-1 ${
                    user.isActive ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {user.isActive ? 'Active' : 'Inactive'}
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => router.push(`/admin/staff/${user._id}/edit`)}
                >
                  Edit
                </Button>

                {user.isActive ? (
                  <Button
                    className="bg-red-600 text-white"
                    onClick={() => updateStatus(user._id, false)}
                  >
                    Deactivate
                  </Button>
                ) : (
                  <Button
                    className="bg-green-600 text-white"
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
