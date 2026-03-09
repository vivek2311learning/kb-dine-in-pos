'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/app/components/ui/button';

export default function StaffForm({ initialData, isEdit = false }: any) {
  const router = useRouter();

  const [name, setName] = useState(initialData?.name || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(initialData?.role || 'counter');

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
      ? `/api/admin/staff/${initialData._id}`
      : '/api/admin/staff';

    const method = isEdit ? 'PATCH' : 'POST';

    await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    router.push('/admin/staff');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-8 max-w-md">
      <div>
        <label htmlFor="name" className="block mb-1 text-sm font-medium">
          Name
        </label>

        <input
          id="name"
          type="text"
          className="border p-2 w-full rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      {!isEdit && (
        <div>
          <label htmlFor="email" className="block mb-1 text-sm font-medium">
            Email
          </label>

          <input
            id="email"
            type="email"
            className="border p-2 w-full rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      )}

      <div>
        <label htmlFor="password" className="block mb-1">
          Password
        </label>
        <input
          id="password"
          type="password"
          className="border p-2 w-full rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required={!isEdit}
        />
      </div>

      <div>
        <label htmlFor="role" className="block mb-1 text-sm font-medium">
          Role
        </label>

        <select
          id="role"
          className="border p-2 w-full rounded"
          value={role}
          onChange={(e) =>
            setRole(e.target.value as 'admin' | 'counter' | 'kitchen')
          }
        >
          <option value="admin">Admin</option>
          <option value="counter">Counter</option>
          <option value="kitchen">Kitchen</option>
        </select>
      </div>

      <Button type="submit">{isEdit ? 'Update Staff' : 'Create Staff'}</Button>
    </form>
  );
}
