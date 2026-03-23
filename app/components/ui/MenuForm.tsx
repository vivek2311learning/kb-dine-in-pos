'use client';

import { useEffect, useState } from 'react';
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

interface MenuCategory {
  _id: string;
  name: string;
  isActive: boolean;
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
    category: initialData?.category || '',
  });

  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  const updateField = (field: keyof MenuItem, value: string | number) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setCategoriesLoading(true);

        const res = await fetch('/api/admin/menu-categories', {
          cache: 'no-store',
          credentials: 'include',
        });

        const data = await res.json();

        if (!res.ok) {
          console.error(data);
          alert(data.error || 'Failed to load categories');
          return;
        }

        const activeCategories = (data || []).filter(
          (cat: MenuCategory) => cat.isActive,
        );

        setCategories(activeCategories);

        setForm((prev) => {
          if (prev.category) return prev;

          return {
            ...prev,
            category: activeCategories[0]?.name || '',
          };
        });
      } catch (err) {
        console.error(err);
        alert('Failed to load categories');
      } finally {
        setCategoriesLoading(false);
      }
    };

    loadCategories();
  }, []);

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      alert('Name is required');
      return;
    }

    if (!form.description.trim()) {
      alert('Description is required');
      return;
    }

    if (!form.price || form.price <= 0) {
      alert('Enter valid price');
      return;
    }

    if (!form.category.trim()) {
      alert('Category is required');
      return;
    }

    try {
      setLoading(true);

      const url = isEdit
        ? `/api/admin/menu/${initialData?._id}`
        : '/api/admin/menu';

      const method = isEdit ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...form,
          name: form.name.trim(),
          description: form.description.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error(data);
        alert(data.error || 'Failed to save item');
        return;
      }

      router.push('/admin/menu');
      router.refresh();
    } catch (err) {
      console.error(err);
      alert('Failed to save item');
    } finally {
      setLoading(false);
    }
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
          disabled={categoriesLoading || loading || categories.length === 0}
        >
          {categories.length === 0 ? (
            <option value="">
              {categoriesLoading
                ? 'Loading categories...'
                : 'No categories available'}
            </option>
          ) : (
            categories.map((category) => (
              <option key={category._id} value={category.name}>
                {category.name}
              </option>
            ))
          )}
        </select>
      </div>

      <Button
        onClick={handleSubmit}
        className="w-full"
        disabled={loading || categoriesLoading || categories.length === 0}
      >
        {loading ? 'Saving...' : 'Save Item'}
      </Button>
    </Card>
  );
}
