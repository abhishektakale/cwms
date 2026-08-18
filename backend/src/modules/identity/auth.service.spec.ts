import { User } from '@prisma/client';
import { AuthService } from './auth.service';
import {
  SESSION_TOUCH_THROTTLE_MS,
  sessionIdleMs,
} from '../../shared/auth/auth.constants';
import { hashToken } from '../../shared/auth/token.util';

function user(overrides: Partial<User> = {}): User {
  return {
    id: 'user-1',
    name: 'Engineer',
    loginId: 'Engineer',
    roleCode: 'Engineer',
    mobile: null,
    email: null,
    isActive: true,
    passwordHash: 'hash',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as User;
}

describe('AuthService session touch throttle', () => {
  const prisma = {
    authSession: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };
  const audit = { append: jest.fn() };
  const passwordPolicy = { validate: jest.fn() };
  let service: AuthService;

  beforeEach(() => {
    prisma.authSession.findUnique.mockReset();
    prisma.authSession.update.mockReset();
    service = new AuthService(
      prisma as never,
      audit as never,
      passwordPolicy as never,
    );
  });

  function sessionRow(lastSeenAgeMs: number, remainingMs: number) {
    const now = Date.now();
    return {
      id: 'sess-1',
      userId: 'user-1',
      revokedAt: null,
      createdAt: new Date(now - lastSeenAgeMs - 1_000),
      lastSeenAt: new Date(now - lastSeenAgeMs),
      expiresAt: new Date(now + remainingMs),
      user: user(),
    };
  }

  it('skips lastSeenAt UPDATE when last seen within 60s', async () => {
    const row = sessionRow(10_000, sessionIdleMs() - 10_000);
    prisma.authSession.findUnique.mockResolvedValue(row);

    const resolved = await service.resolveUserFromRequest({
      cookies: { CWMSSESSION: 'opaque-token' },
    } as never);

    expect(prisma.authSession.findUnique).toHaveBeenCalledWith({
      where: { tokenHash: hashToken('opaque-token') },
      include: { user: true },
    });
    expect(prisma.authSession.update).not.toHaveBeenCalled();
    expect(resolved?.user.id).toBe('user-1');
    expect(resolved?.sessionToken).toBeUndefined();
    expect(resolved?.expiresAt).toBeUndefined();
  });

  it('updates lastSeenAt and returns cookie fields after 60s', async () => {
    const row = sessionRow(
      SESSION_TOUCH_THROTTLE_MS + 1_000,
      sessionIdleMs() - SESSION_TOUCH_THROTTLE_MS - 1_000,
    );
    prisma.authSession.findUnique.mockResolvedValue(row);
    prisma.authSession.update.mockResolvedValue({});

    const resolved = await service.resolveUserFromRequest({
      cookies: { CWMSSESSION: 'opaque-token' },
    } as never);

    expect(prisma.authSession.update).toHaveBeenCalledWith({
      where: { id: 'sess-1' },
      data: {
        lastSeenAt: expect.any(Date),
        expiresAt: expect.any(Date),
      },
    });
    expect(resolved?.sessionToken).toBe('opaque-token');
    expect(resolved?.expiresAt).toBeInstanceOf(Date);
  });

  it('still touches when last seen is fresh but expiry is close', async () => {
    const row = sessionRow(5_000, SESSION_TOUCH_THROTTLE_MS - 1_000);
    prisma.authSession.findUnique.mockResolvedValue(row);
    prisma.authSession.update.mockResolvedValue({});

    const resolved = await service.resolveUserFromRequest({
      cookies: { CWMSSESSION: 'opaque-token' },
    } as never);

    expect(prisma.authSession.update).toHaveBeenCalled();
    expect(resolved?.sessionToken).toBe('opaque-token');
  });
});
