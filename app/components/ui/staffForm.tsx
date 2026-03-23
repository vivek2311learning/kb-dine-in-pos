'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Card } from '@/app/components/ui/card';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
        headers: {
          'Content-Type': 'application/json',
        },
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
      console.error('Staff save failed', error);
      alert('Failed to save staff');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">
        {isEdit ? 'Edit Staff Member' : 'Create Staff Member'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Name"
          value={name}
          placeholder="Staff name"
          onChange={(e) => setName(e.target.value)}
        />

        {!isEdit && (
          <Input
            label="Email"
            type="email"
            value={email}
            placeholder="email@example.com"
            onChange={(e) => setEmail(e.target.value)}
          />
        )}

        <Input
          label="Password"
          type="password"
          value={password}
          placeholder={isEdit ? 'Leave empty to keep current password' : ''}
          required={!isEdit}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="role">
            Role
          </label>

          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            className="w-full border rounded-lg px-4 py-2"
          >
            <option value="admin">Admin</option>
            <option value="counter">Counter</option>
            <option value="kitchen">Kitchen</option>
          </select>
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Saving...' : isEdit ? 'Update Staff' : 'Create Staff'}
        </Button>
      </form>
    </Card>
  );
}
