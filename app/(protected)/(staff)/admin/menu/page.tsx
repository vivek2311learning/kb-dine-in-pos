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

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/admin/menu', {
        cache: 'no-store',
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) {
        console.error(data);
        alert(data.error || 'Failed to load menu');
        return;
      }

      setItems(data || []);
    } catch (err) {
      console.error(err);
      alert('Failed to load menu');
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const updateStatus = async (id: string, action: 'activate' | 'disable') => {
    try {
      setLoadingId(id);

      const res = await fetch(`/api/admin/menu/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error(data);
        alert(data.error || 'Status update failed');
        return;
      }

      await fetchItems();
    } catch (err) {
      console.error(err);
      alert('Status update failed');
    } finally {
      setLoadingId(null);
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm('Permanently delete this item? This cannot be undone.')) {
      return;
    }

    try {
      setLoadingId(id);

      const res = await fetch(`/api/admin/menu/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) {
        console.error(data);
        alert(data.error || 'Delete failed');
        return;
      }

      await fetchItems();
    } catch (err) {
      console.error(err);
      alert('Delete failed');
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

  const getStatusLabel = (status: MenuItem['status']) => {
    return status === 'active' ? 'Enabled' : 'Disabled';
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
        <h1 className="text-2xl md:text-3xl font-bold">Menu Management</h1>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/menu/categories')}
          >
            Categories
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/menu/new')}
            className="text-white"
          >
            + Add Item
          </Button>
        </div>
      </div>

      <input
        placeholder="Search menu..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full md:max-w-md border rounded-lg px-4 py-2"
      />

      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button
          type="button"
          onClick={() => setCategory('')}
          className={category === '' ? 'bg-black text-white' : 'bg-gray-200'}
        >
          All
        </Button>

        {categories.map((cat) => (
          <Button
            type="button"
            key={cat}
            onClick={() => setCategory(cat)}
            className={category === cat ? 'bg-black text-white' : 'bg-gray-200'}
          >
            {cat}
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-sm text-gray-500 border rounded-lg p-6 bg-white">
          No menu items found.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => (
            <Card key={item._id} className="p-4">
              <div className="flex flex-col md:flex-row md:justify-between gap-4">
                <div>
                  <p className="font-semibold text-lg">{item.name}</p>
                  <p className="text-xl">
                    ₹{item.price} • {item.category}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Status: {getStatusLabel(item.status)}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    onClick={() => router.push(`/admin/menu/${item._id}/edit`)}
                  >
                    Edit
                  </Button>

                  {item.status === 'active' ? (
                    <Button
                      type="button"
                      onClick={() => updateStatus(item._id, 'disable')}
                      className="bg-red-600 text-white"
                      disabled={loadingId === item._id}
                    >
                      {loadingId === item._id ? 'Working...' : 'Disable'}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={() => updateStatus(item._id, 'activate')}
                      className="bg-green-600 text-white"
                      disabled={loadingId === item._id}
                    >
                      {loadingId === item._id ? 'Working...' : 'Enable'}
                    </Button>
                  )}

                  <Button
                    type="button"
                    onClick={() => deleteItem(item._id)}
                    className="bg-gray-700 text-white"
                    disabled={loadingId === item._id}
                  >
                    {loadingId === item._id ? 'Working...' : 'Delete'}
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
