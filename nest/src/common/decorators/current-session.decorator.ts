import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { ActiveSession, AuthenticatedRequest } from '../../types/auth.js';

/** Mengambil sesi aktif yang ditempel AuthGuard. Hanya valid pada route ber-AuthGuard. */
export const CurrentSession = createParamDecorator(
  (_data: unknown, context: ExecutionContext): ActiveSession => {
    return context.switchToHttp().getRequest<AuthenticatedRequest>().authSession as ActiveSession;
  }
);
