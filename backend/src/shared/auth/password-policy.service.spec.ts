import { PasswordPolicyService } from './password-policy.service';

describe('PasswordPolicyService (BR-SEC-02)', () => {
  const policy = new PasswordPolicyService();

  it('accepts Password@123', () => {
    expect(() =>
      policy.validate('Password@123', { loginId: 'Engineer', name: 'Engineer' }),
    ).not.toThrow();
  });

  it('rejects short passwords', () => {
    expect(() => policy.validate('Ab1@')).toThrow();
  });

  it('rejects missing symbol', () => {
    expect(() => policy.validate('Password123')).toThrow();
  });

  it('rejects personal login id fragment', () => {
    expect(() =>
      policy.validate('Administrator@1', {
        loginId: 'Administrator',
        name: 'Administrator',
      }),
    ).toThrow();
  });

  it('checklist reflects rules', () => {
    const c = policy.checklist('Password@123');
    expect(c.minLength).toBe(true);
    expect(c.upper).toBe(true);
    expect(c.lower).toBe(true);
    expect(c.number).toBe(true);
    expect(c.symbol).toBe(true);
  });
});
