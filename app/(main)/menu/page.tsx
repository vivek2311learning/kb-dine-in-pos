'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
}

export default function PublicMenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState('');

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await fetch('/api/menu', { cache: 'no-store' });

        if (!res.ok) throw new Error('Failed to load menu');

        const data: MenuItem[] = await res.json();

        setMenuItems(data);

        const cats = [...new Set<string>(data.map((i) => i.category))];
        setCategories(cats);

        if (cats.length > 0) {
          setActiveCategory((prev) =>
            prev && cats.includes(prev) ? prev : cats[0],
          );
        } else {
          setActiveCategory('');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
    }, 200);

    return () => clearTimeout(t);
  }, [search]);

  const filtered = useMemo(() => {
    return menuItems.filter((i) => {
      const matchesSearch = i.name
        .toLowerCase()
        .includes(debouncedSearch.toLowerCase());

      if (debouncedSearch) {
        return matchesSearch;
      }

      return i.category === activeCategory;
    });
  }, [menuItems, activeCategory, debouncedSearch]);

  if (loading) {
    return (
      <div className="p-10 text-center text-gray-500">Loading Menu...</div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold text-center">Our Menu</h1>

      <Input
        placeholder="Search food..."
        value={search}
        onChange={(e: any) => setSearch(e.target.value)}
      />

      <div className="grid grid-cols-2 md:flex gap-2 md:justify-center">
        {categories.map((cat) => {
          const active = activeCategory === cat;

          return (
            <Button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`w-full md:w-auto px-4 py-2 rounded-full text-sm whitespace-nowrap transition ${
                active ? 'bg-black text-white' : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {cat}
            </Button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filtered.map((item) => (
          <Card key={item._id} className="p-4 hover:shadow-md transition">
            <div className="space-y-1">
              <p className="font-semibold">{item.name}</p>
              <p className="text-sm text-gray-500">{item.description}</p>
              <p className="font-bold text-lg">₹{item.price}</p>
            </div>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-gray-400">No items found</p>
      )}
    </div>
  );
}
