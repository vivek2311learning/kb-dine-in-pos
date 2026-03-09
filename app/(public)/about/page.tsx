import { Container } from '@/app/components/layout/container';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Learn more about KB Restaurant, our story, values, and commitment to quality food.',
};

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
          <Card>
            <h3 className="font-rustic text-lg mb-2">Fresh Ingredients</h3>
            <p className="text-sm opacity-80">
              We source fresh, high-quality ingredients to ensure every dish
              tastes just right.
            </p>
          </Card>

          <Card>
            <h3 className="font-rustic text-lg mb-2">Authentic Taste</h3>
            <p className="text-sm opacity-80">
              Our recipes stay true to tradition, preserving original flavors
              and techniques.
            </p>
          </Card>

          <Card>
            <h3 className="font-rustic text-lg mb-2">Warm Hospitality</h3>
            <p className="text-sm opacity-80">
              Guests are family. We believe in serving food with care and
              kindness.
            </p>
          </Card>
        </div>
      </section>
      {/* CTA */}
      <section className="text-center pt-6">
        <Link href="/menu">
          <Button className="px-10 py-3">View Menu</Button>
        </Link>
      </section>
    </Container>
  );
}
