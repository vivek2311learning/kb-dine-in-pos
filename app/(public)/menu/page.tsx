'use client';

import { useEffect, useState } from 'react';
import { Container } from '@/app/components/layout/container';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';

const CATEGORIES = [
  'Starters',
  'Main Course',
  'Beverages',
  'Desserts',
] as const;

type Category = (typeof CATEGORIES)[number];

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
}

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState<Category>('Starters');
  const [items, setItems] = useState<MenuItem[]>([]);

  const fetchMenu = async (category: Category) => {
    const res = await fetch(`/api/menu?category=${category}`);
    const data = await res.json();
    setItems(data);
  };

  useEffect(() => {
    fetchMenu(activeCategory);
  }, [activeCategory]);

  return (
    <Container className="py-12 space-y-12">
      <section className="text-center space-y-2">
        <h1 className="font-rustic text-4xl text-[#3b2a1a]">Our Menu</h1>
        <p className="text-[#3b2a1a]/70">
          Explore our carefully crafted dishes
        </p>
      </section>

      <section className="flex flex-wrap justify-center gap-3">
        {CATEGORIES.map((category) => (
          <Badge
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`cursor-pointer ${
              activeCategory === category ? 'brightness-110' : 'opacity-80'
            }`}
          >
            {category}
          </Badge>
        ))}
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {items.map((item) => (
          <Card key={item._id}>
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-rustic text-lg">{item.name}</h3>
              <span className="font-medium">₹{item.price}</span>
            </div>

            <p className="text-sm opacity-80 mb-4">{item.description}</p>
          </Card>
        ))}
      </section>
    </Container>
  );
}
