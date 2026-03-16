import Link from 'next/link';
import { Container } from '../ui/container';

export function Footer() {
  return (
    <footer className="border-t border-[#3b2a1a]/20 mt-20">
      <Container className="py-8 space-y-6 text-center">
        {/* Footer Links */}

        <nav className="flex justify-center gap-6 text-sm text-[#3b2a1a]/80">
          <Link href="/" className="hover:text-[#3b2a1a] transition">
            Home
          </Link>

          <Link href="/menu" className="hover:text-[#3b2a1a] transition">
            Menu
          </Link>

          <Link href="/about" className="hover:text-[#3b2a1a] transition">
            About
          </Link>

          <Link href="/contact" className="hover:text-[#3b2a1a] transition">
            Contact
          </Link>
        </nav>

        {/* Copyright */}

        <p className="text-sm text-[#3b2a1a]/70">
          © {new Date().getFullYear()} KB Restaurant. All rights reserved.
        </p>
      </Container>
    </footer>
  );
}
