import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { fromNodeHeaders } from 'better-auth/node';
import { AuthService } from '../../modules/auth/auth.service.js';
import type { AuthenticatedRequest } from '../../types/auth.js';

/** Setara requireAuth di /hono: tolak 401 jika tidak ada sesi aktif (cookie atau Bearer). */
@Injectable()
export class AuthGuard implements CanActivate {
  // @Inject(AuthService) bisa dihilangkan karena NestJS sudah bisa membaca tipe secara otomatis
  constructor(private readonly authService: AuthService) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const sessionData = await this.authService.getSession(fromNodeHeaders(req.headers));

    if (!sessionData?.session) {
      // Gunakan built-in exception dari NestJS agar terjamin merespons HTTP 401, bukan 200
      throw new UnauthorizedException('Unauthorized: Silakan login terlebih dahulu');
    }

    req.authSession = sessionData;
    return true;
  }
}