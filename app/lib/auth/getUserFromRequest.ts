import { cookies } from 'next/headers';
import { verifyToken } from './token';

export async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) return null;

  return await verifyToken(token);
}
