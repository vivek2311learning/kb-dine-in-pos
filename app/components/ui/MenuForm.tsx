'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';

interface Props {
  initialData?: any;
  isEdit?: boolean;
}

export default function MenuForm({ initialData, isEdit }: Props) {
  const router = useRouter();

  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(
    initialData?.description || '',
  );
  const [price, setPrice] = useState(initialData?.price || 0);
  const [category, setCategory] = useState(initialData?.category || 'Starters');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name || !price) return;

    setLoading(true);

    const url = isEdit
      ? `/api/admin/menu/${initialData._id}`
      : `/api/admin/menu`;

    const method = isEdit ? 'PATCH' : 'POST';

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        description,
        price,
        category,
      }),
    });

    setLoading(false);
    router.push('/admin/menu');
  };

  return (
    <Card className="p-6 space-y-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold">
        {isEdit ? 'Edit Menu Item' : 'Add Menu Item'}
      </h1>

      <div>
        <label htmlFor="name" className="block mb-1 text-sm">
          Name
        </label>
        <input
          id="name"
          className="border p-2 w-full rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="description" className="block mb-1 text-sm">
          Description
        </label>
        <textarea
          id="description"
          className="border p-2 w-full rounded"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="price" className="block mb-1 text-sm">
          Price
        </label>
        <input
          id="price"
          type="number"
          className="border p-2 w-full rounded"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
        />
      </div>

      <div>
        <label htmlFor="category" className="block mb-1 text-sm">
          Category
        </label>
        <select
          id="category"
          className="border p-2 w-full rounded"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="Starters">Starters</option>
          <option value="Main Course">Main Course</option>
          <option value="Beverages">Beverages</option>
          <option value="Desserts">Desserts</option>
        </select>
      </div>

      <Button onClick={handleSubmit} disabled={loading}>
        {loading ? 'Saving...' : 'Save'}
      </Button>
    </Card>
  );
}
