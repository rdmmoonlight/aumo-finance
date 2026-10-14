#!/usr/bin/env python3
from pathlib import Path
import textwrap

root = Path.cwd()
for _ in range(6):
    if (root / "src" / "app.setup.ts").exists():
        break
    root = root.parent
root = Path.cwd() if root == Path("/") else root

guard_path = root / "src" / "common" / "guards" / "rate-limit.guard.ts"

correct_guard = textwrap.dedent("""
import { CanActivate, ExecutionContext, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { env } from '../../lib/env.js';
import { redis } from '../../lib/redis.js';
import { logger } from '../../lib/logger.js';

const WINDOW_MS = () => (env as any).RATE_LIMIT_WINDOW_MS || 60_000;
const MAX_GLOBAL = () => (env as any).RATE_LIMIT_MAX || 100;
const MAX_AUTH = () => (env as any).AUTH_RATE_LIMIT_MAX || 10;
const TIMEOUT_MS = 1000;

@Injectable()
export class GlobalRateLimitGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: any = context.switchToHttp().getRequest();
    const res: any = context.switchToHttp().getResponse();

    const path = req.originalUrl || req.url || req.path || '';
    const isAuth = path.startsWith('/auth') || path.includes('/auth/');
    const scope = isAuth ? 'auth' : 'global';
    const prefix = scope === 'auth' ? 'ratelimit:auth:' : 'ratelimit:global:';
    const ip = req.ip || req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown';
    const key = `${prefix}${ip}`;
    const max = scope === 'auth' ? MAX_AUTH() : MAX_GLOBAL();
    const windowSec = Math.ceil(WINDOW_MS() / 1000);

    try {
      const pipeline = (redis as any).pipeline();
      pipeline.incr(key);

      const execPromise = pipeline.exec();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('redis timeout')), TIMEOUT_MS)
      );

      let results: any;
      try {
        results = await Promise.race([execPromise, timeoutPromise]);
      } catch (e) {
        logger.warn({ err: e, key }, 'Rate limit redis timeout, fail-open');
        return true;
      }

      const count = Number(results?.[0]?.[1] ?? 1);

      if (count === 1) {
        try {
          await (redis as any).expire(key, windowSec);
        } catch {}
      }

      const remaining = Math.max(0, max - count);
      const reset = Math.floor(Date.now() / 1000) + windowSec;
      res.setHeader('RateLimit-Limit', String(max));
      res.setHeader('RateLimit-Remaining', String(remaining));
      res.setHeader('RateLimit-Reset', String(reset));
      res.setHeader('X-RateLimit-Limit', String(max));
      res.setHeader('X-RateLimit-Remaining', String(remaining));

      if (count > max) {
        res.setHeader('Retry-After', String(windowSec));
        throw new HttpException(
          { success: false, message: 'Terlalu banyak permintaan' },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      return true;
    } catch (err: any) {
      if (err instanceof HttpException) throw err;
      logger.warn({ err, key }, 'Rate limit redis error, fail-open');
      return true;
    }
  }
}

// Untuk AuthController yang pakai @UseGuards(AuthRateLimitGuard)
@Injectable()
export class AuthRateLimitGuard extends GlobalRateLimitGuard {}

// Alias lama biar gak break
export class RateLimitGuard extends GlobalRateLimitGuard {}
""").strip()

guard_path.write_text(correct_guard, encoding="utf-8")
print(f"✓ rewrote {guard_path} with GlobalRateLimitGuard + AuthRateLimitGuard + RateLimitGuard")

# cek auth.guard.ts juga
auth_guard_path = root / "src" / "common" / "guards" / "auth.guard.ts"
if auth_guard_path.exists():
    txt = auth_guard_path.read_text(encoding="utf-8", errors="ignore")
    if "CanActivate" not in txt or "@Injectable" not in txt:
        print(f"⚠️ {auth_guard_path} looks broken, need check")
    else:
        print(f"✓ {auth_guard_path} looks ok")

print("\nDone! pnpm run test lagi")
