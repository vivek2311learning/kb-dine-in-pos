'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Select } from '@/app/components/ui/select';

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

    const body: any = {
      name,
      role,
    };

    if (!isEdit) {
      body.email = email;
      body.password = password;
    }

    if (isEdit && password) {
      body.password = password;
    }

    const url = isEdit
      ? `/api/admin/staff/${initialData?._id}`
      : '/api/admin/staff';

    const method = isEdit ? 'PATCH' : 'POST';

    try {
      setLoading(true);

      await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      router.push('/admin/staff');
      router.refresh();
    } catch (error) {
      console.error('Staff save failed', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card padding="lg" className="max-w-md mx-auto space-y-6">
      <h1 className="text-2xl font-rustic">
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

        <Select
          label="Role"
          value={role}
          onChange={(e) =>
            setRole(e.target.value as Role)
          }
        >
          <option value="admin">Admin</option>
          <option value="counter">Counter</option>
          <option value="kitchen">Kitchen</option>
        </Select>

        <Button
          type="submit"
          disabled={loading}
          className="w-full"
        >
          {loading
            ? 'Saving...'
            : isEdit
            ? 'Update Staff'
            : 'Create Staff'}
        </Button>

      </form>
    </Card>
  );
}