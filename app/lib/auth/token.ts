import { SignJWT, jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export type AuthTokenPayload = {
  userId: string;
  role: 'admin' | 'counter' | 'kitchen';
};

export async function signToken(payload: AuthTokenPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
}

export async function verifyToken(
  token: string,
): Promise<AuthTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);

    if (
      typeof payload === 'object' &&
      'userId' in payload &&
      'role' in payload
    ) {
      return payload as AuthTokenPayload;
    }

    return null;
  } catch {
    return null;
  }
}
