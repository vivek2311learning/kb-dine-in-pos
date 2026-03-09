import Link from 'next/link';
import { Container } from './container';
import { NavigationBar } from './navigation-bar';

export function Header() {
  return (
    <header className="border-b border-[#3b2a1a]/20">
      <Container className="flex items-center justify-between py-4">
        {/* <Link
          href="/"
          className="font-rustic text-2xl text-[#3b2a1a]"
        >
          KB Restaurant
        </Link> */}

        <NavigationBar />
      </Container>
    </header>
  );
}
