'use client';

import { useState, useId } from 'react';
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

  const descriptionId = useId();
  const categoryId = useId();

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

    try {
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      router.push('/admin/menu');
      router.refresh();
    } catch (error) {
      console.error('Menu save failed', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card padding="lg" className="space-y-6 max-w-xl mx-auto">
      
      <h1 className="text-2xl font-bold font-rustic">
        {isEdit ? 'Edit Menu Item' : 'Add Menu Item'}
      </h1>

      <Input
        label="Name"
        value={form.name}
        placeholder="Item name"
        onChange={(e) => updateField('name', e.target.value)}
      />

      {/* Description */}
      <div className="space-y-1.5">
        <label
          htmlFor={descriptionId}
          className="block font-rustic text-sm text-[#3b2a1a]"
        >
          Description
        </label>

        <textarea
          id={descriptionId}
          rows={3}
          className="
            w-full
            px-4 py-2
            rounded-lg
            bg-[#f5efe6]
            text-[#3b2a1a]
            border border-[#3b2a1a]/30
            focus:border-[#3b2a1a]
            focus:outline-none
            shadow-[inset_0_1px_2px_rgba(0,0,0,0.15)]
          "
          value={form.description}
          onChange={(e) => updateField('description', e.target.value)}
        />
      </div>

      <Input
        label="Price"
        type="number"
        value={form.price}
        onChange={(e) => updateField('price', Number(e.target.value))}
      />

      {/* Category */}
      <div className="space-y-1.5">
        <label
          htmlFor={categoryId}
          className="block font-rustic text-sm text-[#3b2a1a]"
        >
          Category
        </label>

        <select
          id={categoryId}
          className="
            w-full
            px-4 py-2
            rounded-lg
            bg-[#f5efe6]
            text-[#3b2a1a]
            border border-[#3b2a1a]/30
            focus:border-[#3b2a1a]
            focus:outline-none
          "
          value={form.category}
          onChange={(e) => updateField('category', e.target.value)}
        >
          <option value="Starters">Starters</option>
          <option value="Main Course">Main Course</option>
          <option value="Beverages">Beverages</option>
          <option value="Desserts">Desserts</option>
        </select>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full"
      >
        {loading ? 'Saving...' : isEdit ? 'Update Item' : 'Save Item'}
      </Button>

    </Card>
  );
}