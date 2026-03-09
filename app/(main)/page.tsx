import { Container } from '@/app/components/layout/container';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import Link from 'next/link';

export default function HomePage() {
  return (
    <Container className="py-14 space-y-20">
      {/* HERO SECTION */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-5">
          <h1 className="font-rustic text-5xl text-[#3b2a1a] leading-tight">
            Authentic Flavors,
            <br />
            Warm Hospitality
          </h1>

          <p className="text-[#3b2a1a]/70 max-w-md">
            Experience traditional recipes made with fresh ingredients and
            served with care. A place where every meal feels like home.
          </p>

          <div className="flex gap-4">
            <Link href="/menu">
              <Button className="px-8 py-3">View Menu</Button>
            </Link>

            <Link href="/contact">
              <Button className="px-8 py-3">Visit Us</Button>
            </Link>
          </div>
        </div>

        {/* HERO IMAGE PLACEHOLDER */}
        <Card className="h-96 flex items-center justify-center text-sm opacity-70">
          Restaurant ambience image
        </Card>
      </section>

      {/* TRUST / HIGHLIGHTS */}
      <section className="space-y-10">
        <h2 className="font-rustic text-3xl text-center text-[#3b2a1a]">
          Why Choose KB Restaurant
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card>
            <h3 className="font-rustic text-lg mb-2">Fresh Ingredients</h3>
            <p className="text-sm opacity-80">
              We use fresh, high-quality ingredients to bring authentic taste to
              every dish.
            </p>
          </Card>

          <Card>
            <h3 className="font-rustic text-lg mb-2">Traditional Recipes</h3>
            <p className="text-sm opacity-80">
              Our menu is inspired by time-tested recipes passed down through
              generations.
            </p>
          </Card>

          <Card>
            <h3 className="font-rustic text-lg mb-2">Comfortable Ambience</h3>
            <p className="text-sm opacity-80">
              A warm and welcoming space where families and friends can enjoy
              good food together.
            </p>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center space-y-4">
        <h2 className="font-rustic text-3xl text-[#3b2a1a]">
          Ready to Taste the Difference?
        </h2>

        <p className="text-sm opacity-80 max-w-xl mx-auto">
          Explore our menu and discover dishes crafted with passion and care.
        </p>

        <Link href="/menu">
          <Button className="px-10 py-3">Explore Menu</Button>
        </Link>
      </section>
    </Container>
  );
}
