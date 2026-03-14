import { Container } from '@/app/components/ui/container';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import Link from 'next/link';

const HIGHLIGHTS = [
  {
    title: 'Fresh Ingredients',
    description:
      'We use fresh, high-quality ingredients to bring authentic taste to every dish.',
  },
  {
    title: 'Traditional Recipes',
    description:
      'Our menu is inspired by time-tested recipes passed down through generations.',
  },
  {
    title: 'Comfortable Ambience',
    description:
      'A warm and welcoming space where families and friends can enjoy good food together.',
  },
];

export default function HomePage() {
  return (
    <Container className="py-16 space-y-28">
      {/* HERO SECTION */}

      <section className="grid grid-cols-1 md:grid-cols-2 gap-14 items-center">
        <div className="space-y-6">
          <h1 className="font-rustic text-5xl md:text-6xl text-[#3b2a1a] leading-tight">
            Authentic Flavors,
            <br />
            Warm Hospitality
          </h1>

          <p className="text-[#3b2a1a]/70 max-w-md leading-relaxed">
            Experience traditional recipes made with fresh ingredients and
            served with care. A place where every meal feels like home.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Button asChild className="px-8 py-3 hover:scale-[1.03]">
              <Link href="/menu">View Menu</Link>
            </Button>

            <Button asChild className="px-8 py-3 hover:scale-[1.03]">
              <Link href="/contact">Visit Us</Link>
            </Button>
          </div>
        </div>

        {/* HERO IMAGE */}

        <Card
          className="h-[420px] bg-cover bg-center relative"
          style={{
            backgroundImage: "url('/image.jpeg')",
          }}
        >
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-xl font-semibold">
            Welcome to Our Restaurant
          </div>
        </Card>
      </section>

      {/* HIGHLIGHTS */}

      <section className="space-y-12">
        <h2 className="font-rustic text-3xl md:text-4xl text-center text-[#3b2a1a]">
          Why Choose KB Restaurant
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {HIGHLIGHTS.map((item) => (
            <Card
              key={item.title}
              className="hover:shadow-xl transition duration-300"
            >
              <h3 className="font-rustic text-lg mb-2">{item.title}</h3>

              <p className="text-sm opacity-80 leading-relaxed">
                {item.description}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}

      <section className="text-center space-y-5">
        <h2 className="font-rustic text-3xl md:text-4xl text-[#3b2a1a]">
          Ready to Taste the Difference?
        </h2>

        <p className="text-sm opacity-80 max-w-xl mx-auto leading-relaxed">
          Explore our menu and discover dishes crafted with passion and care.
        </p>

        <Button asChild className="px-10 py-3 hover:scale-[1.04]">
          <Link href="/menu">Explore Menu</Link>
        </Button>
      </section>
    </Container>
  );
}
