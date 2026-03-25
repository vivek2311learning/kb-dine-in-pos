'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';

export default function MenuCategoriesPage() {
  const router = useRouter();

  const [categories, setCategories] = useState<any[]>([]);
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
      if (res.ok) setCategories(data || []);
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filtered = useMemo(() => {
    return categories.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [categories, search]);

  /* -------- CREATE -------- */
  const handleCreate = async () => {
    if (!name.trim()) return alert('Category required');

    try {
      setLoading(true);

      const res = await fetch('/api/admin/menu-categories', {
        method: 'POST',
        body: JSON.stringify({ name: name.trim() }),
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (!res.ok) return;

      setCategories((prev) => [
        ...prev,
        { _id: Date.now(), name, isActive: true },
      ]);

      setName('');
    } finally {
      setLoading(false);
    }
  };

  /* -------- STATUS -------- */
  const handleStatus = async (id: string, action: 'activate' | 'disable') => {
    setLoadingId(id);

    // 🔥 optimistic
    setCategories((prev) =>
      prev.map((c) =>
        c._id === id ? { ...c, isActive: action === 'activate' } : c,
      ),
    );

    try {
      await fetch(`/api/admin/menu-categories/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ action }),
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
    } finally {
      setLoadingId(null);
    }
  };

  /* -------- DELETE -------- */
  const handleDelete = async (id: string) => {
    if (!confirm('Delete category?')) return;

    setCategories((prev) => prev.filter((c) => c._id !== id));

    await fetch(`/api/admin/menu-categories/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
  };

  return (
    <div className="px-3 py-4 md:px-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-bold">Menu Categories</h1>

          <Button onClick={() => router.push('/admin/menu')}>Back</Button>
        </div>

        {/* ADD */}
        <Card
          variant="ghost"
          className="p-4 border border-[#3b2a1a]/15 bg-transparent"
        >
          <div className="flex gap-2">
            <Input
              placeholder="New category..."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Button size="sm" onClick={handleCreate} disabled={loading}>
              {loading ? 'Adding...' : 'Add'}
            </Button>
          </div>
        </Card>

        {/* SEARCH */}
        <Input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* LIST */}
        {pageLoading ? (
          <div className="text-center text-gray-500 py-10">Loading...</div>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {filtered.map((c) => (
              <Card
                key={c._id}
                variant="ghost"
                className="p-4 border  border-[#3b2a1a]/15 bg-transparent"
              >
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <p className="font-semibold">{c.name}</p>

                    <span className="text-xs">{c.isActive ? '🟢' : '🔴'}</span>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        router.push(`/admin/menu/categories/${c._id}`)
                      }
                    >
                      Edit
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        handleStatus(c._id, c.isActive ? 'disable' : 'activate')
                      }
                      disabled={loadingId === c._id}
                    >
                      {c.isActive ? 'Disable' : 'Enable'}
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(c._id)}
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
