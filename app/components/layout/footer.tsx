import { Container } from './container';

export function Footer() {
  return (
    <footer className="border-t border-[#3b2a1a]/20 mt-20">
      <Container className="py-6 text-center">
        <p className="text-sm text-[#3b2a1a]/70">
          © {new Date().getFullYear()} KB Restaurant. All rights reserved.
        </p>
      </Container>
    </footer>
  );
}
