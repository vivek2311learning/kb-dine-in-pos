'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

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
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  /* ---------------- LOAD CATEGORIES ---------------- */

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
          alert(data.error || 'Failed to load categories');
          return;
        }

        const active = (data || []).filter((c: MenuCategory) => c.isActive);

        setCategories(active);

        setForm((prev) => {
          if (prev.category) return prev;
          return { ...prev, category: active[0]?.name || '' };
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

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async () => {
    if (!form.name.trim()) return alert('Name required');
    if (!form.description.trim()) return alert('Description required');
    if (!form.price || form.price <= 0) return alert('Invalid price');
    if (!form.category.trim()) return alert('Category required');

    try {
      setLoading(true);

      const url = isEdit
        ? `/api/admin/menu/${initialData?._id}`
        : '/api/admin/menu';

      const res = await fetch(url, {
        method: isEdit ? 'PATCH' : 'POST',
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
        alert(data.error || 'Failed to save');
        return;
      }

      router.push('/admin/menu');
      router.refresh();
    } catch (err) {
      console.error(err);
      alert('Failed to save');
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
          label="Item Name"
          value={form.name}
          onChange={(e) => updateField('name', e.target.value)}
        />

        <div>
          <label className="text-sm font-medium">Description</label>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => updateField('description', e.target.value)}
            className="mt-1 w-full rounded-xl border border-[#3b2a1a]/15 bg-transparent px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#3b2a1a]/30"
            placeholder="Short description..."
          />
        </div>
      </div>

      {/* PRICING */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Pricing</h2>

        <Input
          label="Price (₹)"
          type="number"
          value={form.price}
          onChange={(e) => updateField('price', Number(e.target.value))}
        />
      </div>

      {/* CATEGORY */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Category</h2>

        <div className="space-y-1">
          <label htmlFor="category" className="text-sm font-medium">
            Category
          </label>

          <select
            id="category" // ✅ IMPORTANT
            className="w-full rounded-xl border border-[#3b2a1a]/15 bg-transparent px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#3b2a1a]/30"
            value={form.category}
            onChange={(e) => updateField('category', e.target.value)}
            disabled={categoriesLoading || loading}
          >
            {categories.length === 0 ? (
              <option>
                {categoriesLoading ? 'Loading...' : 'No categories available'}
              </option>
            ) : (
              categories.map((c) => (
                <option key={c._id} value={c.name}>
                  {c.name}
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {/* ACTION */}
      <div className="pt-4">
        <Button
          onClick={handleSubmit}
          disabled={loading || categoriesLoading}
          className="w-full"
        >
          {loading ? 'Saving...' : isEdit ? 'Update Item' : 'Create Item'}
        </Button>
      </div>
    </div>
  );
}
