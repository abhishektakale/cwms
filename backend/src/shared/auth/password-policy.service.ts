import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';

export type PasswordContext = {
  name?: string | null;
  loginId?: string | null;
  mobile?: string | null;
};

/**
 * BR-SEC-02 password policy validation.
 */
@Injectable()
export class PasswordPolicyService {
  validate(password: string, ctx: PasswordContext = {}): void {
    const errors: Array<{ field: string; message: string; code: string }> = [];

    if (!password || password.length < 8) {
      errors.push({
        field: 'newPassword',
        message: 'Password must be at least 8 characters',
        code: 'PWD_LENGTH',
      });
    }
    if (!/[A-Z]/.test(password)) {
      errors.push({
        field: 'newPassword',
        message: 'Password must include an uppercase letter',
        code: 'PWD_UPPER',
      });
    }
    if (!/[a-z]/.test(password)) {
      errors.push({
        field: 'newPassword',
        message: 'Password must include a lowercase letter',
        code: 'PWD_LOWER',
      });
    }
    if (!/[0-9]/.test(password)) {
      errors.push({
        field: 'newPassword',
        message: 'Password must include a number',
        code: 'PWD_NUMBER',
      });
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      errors.push({
        field: 'newPassword',
        message: 'Password must include a symbol',
        code: 'PWD_SYMBOL',
      });
    }

    const lowered = password.toLowerCase();
    const personal = [ctx.name, ctx.loginId, ctx.mobile]
      .filter((v): v is string => !!v && v.trim().length >= 3)
      .flatMap((v) => {
        const parts = v.toLowerCase().split(/[\s@._-]+/).filter((p) => p.length >= 3);
        return [v.toLowerCase().replace(/\s+/g, ''), ...parts];
      });

    for (const fragment of personal) {
      if (fragment && lowered.includes(fragment)) {
        errors.push({
          field: 'newPassword',
          message: 'Password must not contain personal details',
          code: 'PWD_PERSONAL',
        });
        break;
      }
    }

    if (errors.length > 0) {
      throw new BadRequestException({
        title: 'Password does not meet policy',
        status: 400,
        code: 'PASSWORD_POLICY',
        errors,
      });
    }
  }

  checklist(password: string, ctx: PasswordContext = {}) {
    const lowered = password.toLowerCase();
    const personal = [ctx.name, ctx.loginId, ctx.mobile]
      .filter((v): v is string => !!v && v.trim().length >= 3)
      .flatMap((v) => {
        const parts = v.toLowerCase().split(/[\s@._-]+/).filter((p) => p.length >= 3);
        return [v.toLowerCase().replace(/\s+/g, ''), ...parts];
      });
    const hasPersonal = personal.some((f) => f && lowered.includes(f));

    return {
      minLength: password.length >= 8,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      symbol: /[^A-Za-z0-9]/.test(password),
      noPersonal: !hasPersonal,
    };
  }
}
