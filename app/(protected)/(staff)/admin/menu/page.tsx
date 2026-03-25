'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';

interface MenuItem {
  _id: string;
  name: string;
  price: number;
  category: string;
  status: 'active' | 'unavailable';
}

export default function AdminMenuPage() {
  const router = useRouter();

  const [items, setItems] = useState<MenuItem[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    try {
      setLoading(true);

      const res = await fetch('/api/admin/menu', {
        cache: 'no-store',
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Failed to load menu');
        return;
      }

      setItems(data || []);
    } catch (err) {
      console.error(err);
      alert('Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  /* 🔥 Optimistic Update (FAST UI) */
  const updateStatus = async (id: string, action: 'activate' | 'disable') => {
    setLoadingId(id);

    // instant UI change
    setItems((prev) =>
      prev.map((i) =>
        i._id === id
          ? { ...i, status: action === 'activate' ? 'active' : 'unavailable' }
          : i,
      ),
    );

    try {
      const res = await fetch(`/api/admin/menu/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action }),
      });

      if (!res.ok) {
        fetchItems(); // rollback
      }
    } catch {
      fetchItems(); // rollback
    } finally {
      setLoadingId(null);
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm('Permanently delete this item?')) return;

    setLoadingId(id);

    // instant remove
    setItems((prev) => prev.filter((i) => i._id !== id));

    try {
      const res = await fetch(`/api/admin/menu/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) {
        fetchItems(); // rollback
      }
    } catch {
      fetchItems();
    } finally {
      setLoadingId(null);
    }
  };

  const categories = useMemo(
    () => [...new Set(items.map((i) => i.category))],
    [items],
  );

  const filtered = useMemo(() => {
    return items.filter(
      (i) =>
        (!category || i.category === category) &&
        i.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [items, category, search]);

  const getStatusStyle = (status: MenuItem['status']) => {
    return status === 'active'
      ? 'text-green-700 border-green-200 bg-green-50/60'
      : 'text-red-700 border-red-200 bg-red-50/60';
  };

  return (
    <div className="px-3 py-4 sm:px-4 md:px-6 md:py-6">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* HEADER */}
        <div className="flex flex-col gap-3 md:flex-row md:justify-between md:items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Menu Management</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage menu items, availability, and categories.
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.push('/admin/menu/categories')}
            >
              Categories
            </Button>

            <Button onClick={() => router.push('/admin/menu/new')}>
              + Add Item
            </Button>
          </div>
        </div>

        {/* FILTERS */}
        <Card
          variant="ghost"
          hover={false}
          className="p-4 border border-[#3b2a1a]/15 bg-transparent shadow-none"
        >
          <div className="space-y-4">
            <input
              placeholder="Search menu items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:max-w-md rounded-xl border border-[#3b2a1a]/15 px-4 py-2.5 outline-none"
            />

            <div className="flex gap-2 overflow-x-auto">
              <Button
                size="sm"
                onClick={() => setCategory('')}
                variant={category === '' ? 'primary' : 'outline'}
              >
                All
              </Button>

              {categories.map((cat) => (
                <Button
                  key={cat}
                  size="sm"
                  onClick={() => setCategory(cat)}
                  variant={category === cat ? 'primary' : 'outline'}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        {/* LIST */}
        {loading ? (
          <Card className="p-8 text-center">Loading menu...</Card>
        ) : filtered.length === 0 ? (
          <Card className="p-8 text-center">No menu items found.</Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {filtered.map((item) => (
              <Card
                key={item._id}
                variant="ghost"
                hover={false}
                className="p-5 border border-[#3b2a1a]/15 bg-transparent shadow-none"
              >
                <div className="space-y-3">
                  <div>
                    <p className="font-semibold text-lg">{item.name}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {item.category}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold">₹{item.price}</span>

                    <span
                      className={`text-xs px-2 py-1 rounded border ${getStatusStyle(
                        item.status,
                      )}`}
                    >
                      {item.status === 'active' ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        router.push(`/admin/menu/${item._id}/edit`)
                      }
                    >
                      Edit
                    </Button>

                    {item.status === 'active' ? (
                      <Button
                        size="sm"
                        className="border-red-500 text-red-700"
                        variant="outline"
                        onClick={() => updateStatus(item._id, 'disable')}
                        disabled={loadingId === item._id}
                      >
                        Disable
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className="border-green-600 text-green-700"
                        variant="outline"
                        onClick={() => updateStatus(item._id, 'activate')}
                        disabled={loadingId === item._id}
                      >
                        Enable
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      className="border-gray-500 text-gray-700"
                      onClick={() => deleteItem(item._id)}
                      disabled={loadingId === item._id}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
