'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';

interface MenuCategory {
  _id: string;
  name: string;
  isActive: boolean;
  createdAt?: string;
}

export default function MenuCategoriesPage() {
  const router = useRouter();

  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [name, setName] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      setPageLoading(true);

      const res = await fetch('/api/admin/menu-categories', {
        cache: 'no-store',
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Failed to load categories');
        return;
      }

      setCategories(data || []);
    } catch (err) {
      console.error(err);
      alert('Failed to load categories');
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filtered = useMemo(() => {
    return categories.filter((category) =>
      category.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [categories, search]);

  const handleCreate = async () => {
    const trimmed = name.trim();

    if (!trimmed) {
      alert('Category name is required');
      return;
    }

    try {
      setLoading(true);

      const res = await fetch('/api/admin/menu-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Failed to create category');
        return;
      }

      setName('');
      await fetchCategories();
    } catch (err) {
      console.error(err);
      alert('Failed to create category');
    } finally {
      setLoading(false);
    }
  };

  const handleStatus = async (id: string, action: 'activate' | 'disable') => {
    try {
      setLoadingId(id);

      const res = await fetch(`/api/admin/menu-categories/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Failed to update category');
        return;
      }

      await fetchCategories();
    } catch (err) {
      console.error(err);
      alert('Failed to update category');
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    const ok = confirm(
      'Delete this category permanently? This will fail if any menu item is using it.',
    );

    if (!ok) return;

    try {
      setLoadingId(id);

      const res = await fetch(`/api/admin/menu-categories/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Failed to delete category');
        return;
      }

      await fetchCategories();
    } catch (err) {
      console.error(err);
      alert('Failed to delete category');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Menu Categories</h1>
          <p className="text-sm text-gray-500 mt-1">
            Add, edit, enable, disable, and delete menu categories
          </p>
        </div>

        <Button type="button" onClick={() => router.push('/admin/menu')}>
          Back to Menu
        </Button>
      </div>

      <Card className="p-4 space-y-4">
        <h2 className="text-lg font-semibold">Add Category</h2>

        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="Enter category name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Button
            type="button"
            onClick={handleCreate}
            disabled={loading}
            className="sm:w-auto"
          >
            {loading ? 'Adding...' : 'Add Category'}
          </Button>
        </div>
      </Card>

      <div className="flex items-center justify-between gap-3">
        <Input
          placeholder="Search categories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Button type="button" onClick={fetchCategories} disabled={pageLoading}>
          Refresh
        </Button>
      </div>

      {pageLoading ? (
        <div className="text-sm text-gray-500">Loading categories...</div>
      ) : filtered.length === 0 ? (
        <Card className="p-6 text-sm text-gray-500">No categories found.</Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((category) => (
            <Card key={category._id} className="p-4">
              <div className="flex flex-col md:flex-row md:justify-between gap-4">
                <div>
                  <p className="font-semibold text-lg">{category.name}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Status: {category.isActive ? 'Enabled' : 'Disabled'}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    onClick={() =>
                      router.push(`/admin/menu/categories/${category._id}`)
                    }
                  >
                    Edit
                  </Button>

                  {category.isActive ? (
                    <Button
                      type="button"
                      onClick={() => handleStatus(category._id, 'disable')}
                      className="bg-red-600 text-white"
                      disabled={loadingId === category._id}
                    >
                      {loadingId === category._id ? 'Working...' : 'Disable'}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={() => handleStatus(category._id, 'activate')}
                      className="bg-green-600 text-white"
                      disabled={loadingId === category._id}
                    >
                      {loadingId === category._id ? 'Working...' : 'Enable'}
                    </Button>
                  )}

                  <Button
                    type="button"
                    onClick={() => handleDelete(category._id)}
                    className="bg-gray-700 text-white"
                    disabled={loadingId === category._id}
                  >
                    {loadingId === category._id ? 'Working...' : 'Delete'}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
