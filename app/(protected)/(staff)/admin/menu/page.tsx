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

  const fetchItems = async () => {
    const res = await fetch('/api/admin/menu');
    const data = await res.json();
    setItems(data);
  };

  const router = useRouter();

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
    await fetch(`/api/admin/menu/${id}`, {
      method: 'DELETE',
    });

    fetchItems();
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Menu Management</h1>
        <Button
          onClick={() => router.push('/admin/menu/new')}
          className="bg-green-600 text-white"
        >
          + Add Item
        </Button>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <Card key={item._id} className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">{item.name}</p>
                <p className="text-sm">
                  ₹{item.price} • {item.category}
                </p>
                <p className="text-xs mt-1">Status: {item.status}</p>
              </div>

              <div className="flex gap-2 flex-wrap">
                {/* EDIT */}
                <Button
                  onClick={() => router.push(`/admin/menu/${item._id}/edit`)}
                >
                  Edit
                </Button>

                {/* STATUS ACTIONS */}
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

                {item.status !== 'archived' && (
                  <Button
                    className="bg-red-600 text-white"
                    onClick={() => updateStatus(item._id, 'archive')}
                  >
                    Archive
                  </Button>
                )}

                {/* HARD DELETE */}
                <Button
                  className="bg-gray-700 text-white"
                  onClick={() => deleteItem(item._id)}
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
