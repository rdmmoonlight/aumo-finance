import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { fromNodeHeaders } from 'better-auth/node';
import { AppError } from '../../lib/errors.js';
import { AuthService } from '../../modules/auth/auth.service.js';
import type { AuthenticatedRequest } from '../../types/auth.js';

/** Setara requireAuth di /hono: tolak 401 jika tidak ada sesi aktif (cookie atau Bearer). */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const sessionData = await this.authService.getSession(fromNodeHeaders(req.headers));

    if (!sessionData?.session) {
      throw new AppError('Unauthorized: Silakan login terlebih dahulu', 401);
    }

    req.authSession = sessionData;
    return true;
  }
}
