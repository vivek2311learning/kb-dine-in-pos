import type { Metadata } from 'next';
import { Container } from '@/app/components/ui/container';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Contact KB Restaurant',
  description:
    'Find KB Restaurant location, contact details, opening hours and reservation options.',
};

const CONTACT = {
  phone: '+91 98765 43210',
  email: 'contact@kbrestaurant.com',
  address: '123 Main Street, City Name, India',
};

export default function ContactPage() {
  return (
    <Container className="py-16 space-y-20">
      {/* HEADER */}

      <section className="max-w-2xl space-y-4">
        <h1 className="font-rustic text-4xl text-[#3b2a1a]">
          Visit KB Restaurant
        </h1>

        <p className="text-[#3b2a1a]/80 leading-relaxed">
          Whether you&apos;re planning a casual meal, celebrating a special
          occasion, or simply exploring great food — we&apos;d love to welcome
          you. Find our location, contact details, and reservation options
          below.
        </p>
      </section>

      {/* CONTACT + MAP */}

      <section className="grid md:grid-cols-2 gap-12 items-start">
        {/* INFO CARD */}

        <Card className="p-10 space-y-8 border-[#3b2a1a]/20">
          <h2 className="font-rustic text-2xl">Restaurant Information</h2>

          <div className="space-y-6 text-sm text-[#3b2a1a]/90">
            <div>
              <p className="font-medium text-base">Address</p>
              <p className="opacity-80 leading-relaxed">{CONTACT.address}</p>
            </div>

            <div>
              <p className="font-medium text-base">Phone</p>
              <a
                href="tel:+919876543210"
                className="opacity-80 hover:underline"
              >
                {CONTACT.phone}
              </a>
            </div>

            <div>
              <p className="font-medium text-base">Email</p>
              <a
                href={`mailto:${CONTACT.email}`}
                className="opacity-80 hover:underline"
              >
                {CONTACT.email}
              </a>
            </div>

            <div>
              <p className="font-medium text-base">Opening Hours</p>
              <p className="opacity-80">
                Monday – Sunday <br />
                11:00 AM – 11:00 PM
              </p>
            </div>
          </div>
        </Card>

        {/* MAP */}

        <div className="rounded-xl overflow-hidden border border-[#3b2a1a]/20">
          <iframe
            title="KB Restaurant Location Map"
            src="https://www.google.com/maps?q=KB%20Restaurant&output=embed"
            className="w-full h-[360px] md:h-[420px] border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>

      {/* QUICK ACTIONS */}

      <section className="grid sm:grid-cols-3 gap-6">
        <Card className="p-6 text-center space-y-4">
          <h3 className="font-rustic text-xl">Call Us</h3>

          <p className="text-sm opacity-80">
            Speak directly with our team for reservations or inquiries.
          </p>

          <Button asChild className="w-full">
            <a href="tel:+919876543210">Call Now</a>
          </Button>
        </Card>

        <Card className="p-6 text-center space-y-4">
          <h3 className="font-rustic text-xl">Get Directions</h3>

          <p className="text-sm opacity-80">
            Find the quickest route to reach our restaurant.
          </p>

          <Button asChild className="w-full">
            <Link
              href="https://maps.google.com/?q=KB Restaurant"
              target="_blank"
            >
              Open Map
            </Link>
          </Button>
        </Card>

        <Card className="p-6 text-center space-y-4">
          <h3 className="font-rustic text-xl">Book a Table</h3>

          <p className="text-sm opacity-80">
            Reserve your table in advance to avoid waiting.
          </p>

          <Button asChild className="w-full">
            <Link href="/reservation">Reserve Now</Link>
          </Button>
        </Card>
      </section>

      {/* HELP SECTION */}

      <section className="text-center space-y-6 max-w-2xl mx-auto">
        <h2 className="font-rustic text-3xl text-[#3b2a1a]">
          Need Assistance?
        </h2>

        <p className="text-sm text-[#3b2a1a]/80 leading-relaxed">
          Our team is here to help with reservations, menu inquiries, private
          events, and any questions you may have. Don&apos;t hesitate to reach
          out — we&apos;re always happy to assist.
        </p>
      </section>
    </Container>
  );
}
