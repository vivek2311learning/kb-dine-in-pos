'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';

interface Props {
  initialData?: {
    _id: string;
    name: string;
  };
  isEdit?: boolean;
}

export default function CategoryForm({ initialData, isEdit }: Props) {
  const router = useRouter();

  const [name, setName] = useState(initialData?.name || '');
  const [loading, setLoading] = useState(false);

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async () => {
    if (!name.trim()) {
      alert('Category name required');
      return;
    }

    try {
      setLoading(true);

      const url = isEdit
        ? `/api/admin/menu-categories/${initialData?._id}`
        : '/api/admin/menu-categories';

      const res = await fetch(url, {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: name.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data?.error || 'Failed to save category');
        return;
      }

      router.push('/admin/menu/categories');
      router.refresh();
    } catch (err) {
      console.error(err);
      alert('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="space-y-6">
      {/* BASIC INFO (same like MenuForm) */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Basic Information</h2>

        <Input
          label="Category Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      {/* OPTIONAL FUTURE SECTION (keeps structure scalable) */}
      {/* 
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Settings</h2>
      </div> 
      */}

      {/* ACTION */}
      <div className="pt-2">
        <Button onClick={handleSubmit} disabled={loading} className="w-full">
          {loading
            ? 'Saving...'
            : isEdit
              ? 'Update Category'
              : 'Create Category'}
        </Button>
      </div>
    </div>
  );
}
