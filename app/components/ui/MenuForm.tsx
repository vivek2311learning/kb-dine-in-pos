'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';

interface MenuItem {
  _id?: string;
  name: string;
  description: string;
  price: number;
  category: string;
}

interface Props {
  initialData?: MenuItem;
  isEdit?: boolean;
}

export default function MenuForm({ initialData, isEdit }: Props) {
  const router = useRouter();

  const [form, setForm] = useState<MenuItem>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    price: initialData?.price || 0,
    category: initialData?.category || 'Starters',
  });

  const [loading, setLoading] = useState(false);

  const updateField = (field: keyof MenuItem, value: any) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.price) return;

    setLoading(true);

    const url = isEdit
      ? `/api/admin/menu/${initialData?._id}`
      : `/api/admin/menu`;

    const method = isEdit ? 'PATCH' : 'POST';

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    router.push('/admin/menu');
    router.refresh();
  };

  return (
    <Card className="p-6 max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">
        {isEdit ? 'Edit Menu Item' : 'Add Menu Item'}
      </h1>
      <Input
        label="Name"
        value={form.name}
        onChange={(e) => updateField('name', e.target.value)}
      />

      <textarea
        className="w-full border rounded-lg px-4 py-2"
        rows={3}
        value={form.description}
        onChange={(e) => updateField('description', e.target.value)}
        placeholder="Description"
      />

      <Input
        label="Price"
        type="number"
        value={form.price}
        onChange={(e) => updateField('price', Number(e.target.value))}
      />

      <div className="space-y-1">
        <label className="text-sm font-medium" htmlFor="category">
          Category
        </label>

        <select
          id="category"
          className="w-full border rounded-lg px-4 py-2"
          value={form.category}
          onChange={(e) => updateField('category', e.target.value)}
        >
          <option>Starters</option>
          <option>Main Course</option>
          <option>Beverages</option>
          <option>Desserts</option>
        </select>
      </div>

      <Button onClick={handleSubmit} className="w-full" disabled={loading}>
        {loading ? 'Saving...' : 'Save Item'}
      </Button>
    </Card>
  );
}
