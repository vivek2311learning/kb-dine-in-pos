'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

import { Loader } from '@/app/components/ui/loader';
import { useNotification } from '@/app/components/notification/provider';
import { Container } from '@/app/components/ui/container';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';

type Role = 'admin' | 'counter' | 'kitchen';

function redirectByRole(router: any, role: Role) {
  if (role === 'admin') router.replace('/admin/dashboard');
  if (role === 'counter') router.replace('/counter/tables');
  if (role === 'kitchen') router.replace('/kitchen/orders');
}

/* ---------------- LOGIN FORM ---------------- */

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { show } = useNotification();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ---------------- FLASH MESSAGES ---------------- */

  useEffect(() => {
    const flash = searchParams.get('flash');
    const unauthorized = searchParams.get('unauthorized');
    const expired = searchParams.get('expired');

    if (!flash && !unauthorized && !expired) return;

    if (flash === 'logout') {
      show('success', 'Logged out successfully');
    }

    if (unauthorized) {
      show('error', 'Access denied. Please login.');
    }

    if (expired) {
      show('error', 'Session expired. Please login again.');
    }

    router.replace('/login');
  }, [searchParams, router, show]);

  /* ---------------- BLOCK LOGIN PAGE IF LOGGED IN ---------------- */

  useEffect(() => {
    const roleMatch = document.cookie.match(/user_role=([^;]+)/);

    if (!roleMatch) return;

    const role = roleMatch[1] as Role;

    redirectByRole(router, role);
  }, [router]);

  /* ---------------- LOGIN SUBMIT ---------------- */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Invalid credentials');
      }

      redirectByRole(router, data.role);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';

      show('error', message, 'Login Failed');
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <Container className="py-20">
      <div className="max-w-md mx-auto">
        <Card className="p-6">
          <div className="text-center mb-6">
            <h1 className="font-rustic text-3xl text-[#3b2a1a]">
              Welcome Back
            </h1>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />

            <Input
              label="Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />

            {error && (
              <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="w-full py-3 flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader size="sm" />
                  <span>Logging in…</span>
                </>
              ) : (
                'Login'
              )}
            </Button>
          </form>
        </Card>
      </div>
    </Container>
  );
}

/* ---------------- PAGE ---------------- */

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
