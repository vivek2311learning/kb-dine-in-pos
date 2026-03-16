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
  const router = useRouter();

  const [items, setItems] = useState<MenuItem[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  const fetchItems = async () => {
    const res = await fetch('/api/admin/menu', {
      cache: 'no-store',
    });

    const data = await res.json();

    setItems(data);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const updateStatus = async (id: string, action: string) => {
    await fetch(`/api/admin/menu/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });

    fetchItems();
  };

  const deleteItem = async (id: string) => {
    if (!confirm('Delete permanently?')) return;

    await fetch(`/api/admin/menu/${id}`, {
      method: 'DELETE',
    });

    fetchItems();
  };

  const categories = [...new Set(items.map((i) => i.category))];

  const filtered = items.filter(
    (i) =>
      (!category || i.category === category) &&
      i.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold">Menu Management</h1>
        <Button
          onClick={() => router.push('/admin/menu/new')}
          className="bg-green-600 text-white"
        >
          + Add Item
        </Button>
      </div>
      <input
        placeholder="Search menu..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full md:max-w-md border rounded-lg px-4 py-2"
      />

      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button
          onClick={() => setCategory('')}
          className={category === '' ? 'bg-black text-white' : 'bg-gray-200'}
        >
          All
        </Button>
        {categories.map((cat) => (
          <Button
            key={cat}
            onClick={() => setCategory(cat)}
            className={category === cat ? 'bg-black text-white' : 'bg-gray-200'}
          >
            {cat}
          </Button>
        ))}
      </div>
      <div className="space-y-4">
        {filtered.map((item) => (
          <Card key={item._id} className="p-4">
            <div className="flex flex-col md:flex-row md:justify-between gap-4">
              <div>
                <p className="font-semibold text-lg">{item.name}</p>
                <p className="text-sm text-gray-500">
                  ₹{item.price} • {item.category}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => router.push('/admin/menu/${item._id}/edit')}
                >
                  Edit
                </Button>
                <Button
                  onClick={() => updateStatus(item._id, 'archive')}
                  className="bg-red-600 text-white"
                >
                  Archive
                </Button>
                <Button
                  onClick={() => deleteItem(item._id)}
                  className="bg-gray-700 text-white"
                >
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
