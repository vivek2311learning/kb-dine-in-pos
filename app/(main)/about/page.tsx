import { Container } from '@/app/components/ui/container';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Learn more about KB Restaurant, our story, values, and commitment to quality food.',
};

const VALUES = [
  {
    title: 'Fresh Ingredients',
    text: 'We source fresh, high-quality ingredients to ensure every dish tastes just right.',
  },
  {
    title: 'Authentic Taste',
    text: 'Our recipes stay true to tradition, preserving original flavors and techniques.',
  },
  {
    title: 'Warm Hospitality',
    text: 'Guests are family. We believe in serving food with care and kindness.',
  },
];

export default function AboutPage() {
  return (
    <Container className="py-14 space-y-16">
      {/* PAGE HEADER */}

      <section className="text-center space-y-3 max-w-2xl mx-auto">
        <h1 className="font-rustic text-4xl text-[#3b2a1a]">
          About KB Restaurant
        </h1>

        <p className="text-[#3b2a1a]/70">
          Serving authentic flavors with warmth and tradition
        </p>
      </section>

      {/* STORY */}

      <section className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <Card>
          <h2 className="font-rustic text-2xl mb-3">Our Story</h2>

          <p className="text-sm opacity-90 leading-relaxed">
            KB Restaurant was founded with a simple vision — to bring
            traditional recipes, fresh ingredients, and heartfelt hospitality
            together. Every dish we serve carries the essence of home-style
            cooking, inspired by generations of culinary tradition.
          </p>
        </Card>

        <Card>
          <h2 className="font-rustic text-2xl mb-3">Our Philosophy</h2>

          <p className="text-sm opacity-90 leading-relaxed">
            We believe great food doesn’t need to be complicated. Quality
            ingredients, careful preparation, and respect for flavors are at the
            heart of everything we do.
          </p>
        </Card>
      </section>

      {/* VALUES */}

      <section className="space-y-8">
        <h2 className="font-rustic text-3xl text-center text-[#3b2a1a]">
          What We Stand For
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {VALUES.map((value) => (
            <Card key={value.title}>
              <h3 className="font-rustic text-lg mb-2">{value.title}</h3>

              <p className="text-sm opacity-80">{value.text}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}

      <section className="text-center pt-6">
        <Button asChild className="px-10 py-3">
          <Link href="/menu">View Menu</Link>
        </Button>
      </section>
    </Container>
  );
}
