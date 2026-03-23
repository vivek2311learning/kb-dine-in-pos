'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';

interface CategoryData {
  _id?: string;
  name: string;
  isActive?: boolean;
}

interface Props {
  initialData?: CategoryData;
  isEdit?: boolean;
}

export default function CategoryForm({ initialData, isEdit }: Props) {
  const router = useRouter();

  const [name, setName] = useState(initialData?.name || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const trimmed = name.trim();

    if (!trimmed) {
      alert('Category name is required');
      return;
    }

    try {
      setLoading(true);

      const url = isEdit
        ? `/api/admin/menu-categories/${initialData?._id}`
        : '/api/admin/menu-categories';

      const method = isEdit ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Failed to save category');
        return;
      }

      router.push('/admin/menu/categories');
      router.refresh();
    } catch (err) {
      console.error(err);
      alert('Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">
        {isEdit ? 'Edit Category' : 'Add Category'}
      </h1>

      <Input
        label="Category Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter category name"
      />

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => router.push('/admin/menu/categories')}
          disabled={loading}
        >
          Cancel
        </Button>

        <Button
          type="button"
          className="w-full"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Category'}
        </Button>
      </div>
    </Card>
  );
}
