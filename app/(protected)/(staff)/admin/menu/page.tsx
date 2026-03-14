'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';

interface MenuItem {
  _id: string;
  name: string;
  price: number;
  category: string;
  status: string;
}

export default function AdminMenuPage() {

  const [items, setItems] = useState<MenuItem[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  /* ================= FETCH ================= */

  const fetchItems = async () => {

    try {

      const res = await fetch('/api/admin/menu', { cache: 'no-store' });
      const data = await res.json();

      setItems(data);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }

  };

  useEffect(() => {
    fetchItems();
  }, []);

  /* ================= ACTIONS ================= */

  const updateStatus = async (id: string, action: string) => {

    await fetch(`/api/admin/menu/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });

    fetchItems();

  };

  const deleteItem = async (id: string) => {

    const ok = window.confirm('Delete this menu item permanently?');

    if (!ok) return;

    await fetch(`/api/admin/menu/${id}`, {
      method: 'DELETE',
    });

    fetchItems();

  };

  /* ================= FILTER ================= */

  const categories = [...new Set(items.map((i) => i.category))];

  const filtered = items.filter(
    (i) =>
      (!category || i.category === category) &&
      i.name.toLowerCase().includes(search.toLowerCase()),
  );

  /* ================= STATUS COLOR ================= */

  const statusColor = (status: string) => {

    switch (status) {

      case 'active':
        return 'bg-green-100 text-green-700';

      case 'draft':
        return 'bg-yellow-100 text-yellow-700';

      case 'unavailable':
        return 'bg-orange-100 text-orange-700';

      case 'archived':
        return 'bg-gray-200 text-gray-600';

      default:
        return 'bg-gray-100 text-gray-600';

    }

  };

  /* ================= UI ================= */

  if (loading) {
    return <div className="p-6 text-gray-500">Loading menu...</div>;
  }

  return (

    <div className="p-6 md:p-8 space-y-6 max-w-6xl mx-auto">

      {/* HEADER */}

      <div className="flex justify-between items-center">

        <h1 className="text-3xl font-bold">
          Menu Management
        </h1>

        <Button
          className="bg-green-600 text-white"
          onClick={() => router.push('/admin/menu/new')}
        >
          + Add Item
        </Button>

      </div>


      {/* SEARCH */}

      <div className="max-w-md">

        <input
          type="text"
          placeholder="🔍 Search menu item..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-black/20"
        />

      </div>


      {/* CATEGORY TABS */}

      <div className="grid grid-cols-2 gap-2 md:flex md:flex-wrap md:justify-center">

        <Button
          onClick={() => setCategory('')}
          className={category === '' ? 'bg-black text-white' : 'bg-gray-200'}
        >
          All
        </Button>

        {categories.map((cat) => {

          const active = category === cat;

          return (

            <Button
              key={cat}
              onClick={() => setCategory(cat)}
              className={active ? 'bg-black text-white' : 'bg-gray-200'}
            >
              {cat}
            </Button>

          );

        })}

      </div>


      {/* COUNT */}

      <p className="text-sm text-gray-500">
        {filtered.length} items
      </p>


      {/* LIST */}

      <div className="space-y-4">

        {filtered.map((item) => (

          <Card
            key={item._id}
            className={`p-4 ${item.status === 'archived' ? 'opacity-60 bg-gray-50' : ''}`}
          >

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

              {/* INFO */}

              <div>

                <p className="font-semibold text-lg">
                  {item.name}
                </p>

                <p className="text-sm text-gray-500">
                  ₹{item.price} • {item.category}
                </p>

                <span
                  className={`text-xs px-2 py-1 rounded ${statusColor(item.status)}`}
                >
                  {item.status}
                </span>

              </div>


              {/* ACTIONS */}

              <div className="flex flex-wrap gap-2">

                <Button
                  onClick={() => router.push(`/admin/menu/${item._id}/edit`)}
                >
                  Edit
                </Button>

                {item.status === 'draft' && (
                  <Button onClick={() => updateStatus(item._id, 'activate')}>
                    Activate
                  </Button>
                )}

                {item.status === 'active' && (
                  <Button onClick={() => updateStatus(item._id, 'disable')}>
                    Disable
                  </Button>
                )}

                {item.status === 'unavailable' && (
                  <Button onClick={() => updateStatus(item._id, 'activate')}>
                    Re-Activate
                  </Button>
                )}

                {item.status === 'archived' && (
                  <Button
                    className="bg-green-600 text-white"
                    onClick={() => updateStatus(item._id, 'activate')}
                  >
                    Restore
                  </Button>
                )}

                {item.status !== 'archived' && (
                  <Button
                    className="bg-red-600 text-white"
                    onClick={() => updateStatus(item._id, 'archive')}
                  >
                    Archive
                  </Button>
                )}

                {item.status === 'archived' && (
                  <Button
                    className="bg-gray-700 text-white"
                    onClick={() => deleteItem(item._id)}
                  >
                    Delete
                  </Button>
                )}

              </div>

            </div>

          </Card>

        ))}

        {filtered.length === 0 && (
          <p className="text-gray-500">
            No menu items found
          </p>
        )}

      </div>

    </div>

  );

}