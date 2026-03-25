'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';

type Role = 'admin' | 'counter' | 'kitchen';

interface Staff {
  _id?: string;
  name: string;
  email?: string;
  role: Role;
}

interface Props {
  initialData?: Staff;
  isEdit?: boolean;
}

export default function StaffForm({ initialData, isEdit = false }: Props) {
  const router = useRouter();

  const [name, setName] = useState(initialData?.name || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>(initialData?.role || 'counter');
  const [loading, setLoading] = useState(false);

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      alert('Name is required');
      return;
    }

    if (!isEdit && !trimmedEmail) {
      alert('Email is required');
      return;
    }

    if (!isEdit && !password.trim()) {
      alert('Password is required');
      return;
    }

    const body: Record<string, any> = {
      name: trimmedName,
      role,
    };

    if (!isEdit) {
      body.email = trimmedEmail;
      body.password = password;
    }

    if (isEdit && password.trim()) {
      body.password = password;
    }

    const url = isEdit
      ? `/api/admin/staff/${initialData?._id}`
      : '/api/admin/staff';

    const method = isEdit ? 'PATCH' : 'POST';

    try {
      setLoading(true);

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Failed to save staff');
        return;
      }

      router.push('/admin/staff');
      router.refresh();
    } catch (error) {
      console.error(error);
      alert('Failed to save staff');
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="space-y-6">
      {/* BASIC INFO */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Basic Information</h2>

        <Input
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {!isEdit && (
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        )}
      </div>

      {/* SECURITY */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Security</h2>

        <Input
          label="Password"
          type="password"
          value={password}
          placeholder={isEdit ? 'Leave empty to keep current password' : ''}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {/* ROLE */}
      <div className="space-y-2">
        <label htmlFor="role" className="text-sm font-medium text-gray-700">
          Role
        </label>

        <select
          id="role"
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
          className="w-full rounded-xl border border-[#3b2a1a]/15 bg-transparent px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#3b2a1a]/30"
        >
          <option value="admin">Admin</option>
          <option value="counter">Counter</option>
          <option value="kitchen">Kitchen</option>
        </select>
      </div>

      {/* ACTION */}
      <div className="pt-2">
        <Button onClick={handleSubmit} disabled={loading} className="w-full">
          {loading ? 'Saving...' : isEdit ? 'Update Staff' : 'Create Staff'}
        </Button>
      </div>
    </div>
  );
}
