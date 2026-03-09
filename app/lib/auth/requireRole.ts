import type { AuthTokenPayload } from './token';
import { getUser } from './getUserFromRequest';

export async function requireRole(allowedRoles: AuthTokenPayload['role'][]) {
  const user = await getUser();

  if (!user) {
    throw new Error('UNAUTHORIZED');
  }

  if (!allowedRoles.includes(user.role)) {
    throw new Error('FORBIDDEN');
  }

  return user;
}
