import type { Metadata } from 'next';
import { Container } from '@/app/components/layout/container';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Get in touch with KB Restaurant. Find our location, contact details, and opening hours.',
};

export default function ContactPage() {
  return (
    <Container className="py-12 space-y-14">
      {/* PAGE HEADER */}
      <section className="space-y-2 max-w-2xl">
        <h1 className="font-rustic text-4xl text-[#3b2a1a]">Contact Us</h1>
        <p className="text-[#3b2a1a]/90">
          We’d love to hear from you. Visit us or reach out anytime.
        </p>
      </section>

      {/* CONTACT DETAILS + MAP */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* CONTACT INFO */}
        <Card>
          <h2 className="font-rustic text-2xl mb-4">Restaurant Details</h2>

          <div className="space-y-3 text-sm opacity-90">
            <p>
              <strong>Address:</strong>
              <br />
              123 Main Street, City Name, India
            </p>

            <p>
              <strong>Phone:</strong>
              <br />
              +91 98765 43210
            </p>

            <p>
              <strong>Email:</strong>
              <br />
              contact@kbrestaurant.com
            </p>

            <p>
              <strong>Opening Hours:</strong>
              <br />
              Mon – Sun: 11:00 AM – 11:00 PM
            </p>
          </div>

          <div className="pt-6">
            <Button className="px-6 py-2 text-sm">Call Now</Button>
          </div>
        </Card>

        {/* MAP */}
        <Card className="p-0 overflow-hidden">
          <iframe
            title="KB Restaurant Location Map"
            aria-label="KB Restaurant Location Map"
            src="https://www.google.com/maps?q=123%20Main%20Street%20India&output=embed"
            className="w-full h-96 border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </Card>
      </section>
      {/* CTA */}
      <section className="text-center pt-10 space-y-3">
        <div>
          <p className="text-sm opacity-80">Ready to enjoy a delicious meal?</p>
        </div>
        <Button className="px-10 py-3">Book a Table</Button>
      </section>
      <section className="space-y-8">
        <h2 className="font-rustic text-3xl text-center text-[#3b2a1a]/90">
          We’re Here to Help
        </h2>
        <p className="text-sm  text-[#3b2a1a]/90 leading-relaxed text-center max-w-xl mx-auto">
          Whether you have questions about our menu, want to make a reservation,
          or just want to say hello, we’re always happy to hear from you. Our
          team is here to assist you with anything you need.
        </p>
      </section>
    </Container>
  );
}
