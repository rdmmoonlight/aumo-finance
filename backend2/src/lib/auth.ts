import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import type { JwtPayload } from '../types/auth.types.js';
import { env } from './env.js';

const SALT_ROUNDS = 12;

// --- FIX: export type yang dicari file lain ---
export type TokenPayload = Omit<JwtPayload, 'iat' | 'exp' | 'iss' | 'aud'>;
export type { JwtPayload };

/**
 * ASP.NET Identity V3 hasher - KEEP for backward compatibility
 */
export function hashPasswordAspNet(password: string): string {
    const salt = crypto.randomBytes(16);
    const subkey = crypto.pbkdf2Sync(password, salt, 10000, 32, 'sha256');
    const output = Buffer.alloc(1 + 4 + 4 + 4 + 16 + 32);
    output.writeUInt8(0x01, 0);
    output.writeUInt32BE(1, 1); // HMACSHA256
    output.writeUInt32BE(10000, 5);
    output.writeUInt32BE(16, 9);
    salt.copy(output, 13);
    subkey.copy(output, 29);
    return output.toString('base64');
}

export function verifyPasswordAspNet(password: string, hashedBase64: string): boolean {
    try {
        const decoded = Buffer.from(hashedBase64, 'base64');
        if (decoded.length < 61) return false;
        const prf = decoded.readUInt32BE(1);
        const iterCount = decoded.readUInt32BE(5);
        const saltLength = decoded.readUInt32BE(9);
        if (prf !== 1 || saltLength !== 16) return false;

        const salt = decoded.subarray(13, 13 + saltLength);
        const expectedSubkey = decoded.subarray(13 + saltLength);
        const actualSubkey = crypto.pbkdf2Sync(password, salt, iterCount, 32, 'sha256');
        return crypto.timingSafeEqual(expectedSubkey, actualSubkey);
    } catch {
        return false;
    }
}

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
    if (!hash) return false;
    if (hash.startsWith('AQAAAA')) {
        return verifyPasswordAspNet(plain, hash);
    }
    if (hash.startsWith('$2a$') || hash.startsWith('$2b$') || hash.startsWith('$2y$')) {
        return bcrypt.compare(plain, hash);
    }
    try {
        if (await bcrypt.compare(plain, hash)) return true;
    } catch { }
    return verifyPasswordAspNet(plain, hash);
}

export function signJwt(payload: TokenPayload, expiresIn = '30d'): string {
    if (!env.JWT_SIGNING_KEY) throw new Error('JWT_SIGNING_KEY is missing');
    return jwt.sign(payload, env.JWT_SIGNING_KEY, {
        issuer: env.JWT_ISSUER || 'AumoFinanceApp',
        audience: env.JWT_ISSUER || 'AumoFinanceApp',
        expiresIn,
        algorithm: 'HS256',
    } as jwt.SignOptions);
}

export function verifyJwt(token: string): JwtPayload | null {
    try {
        return jwt.verify(token, env.JWT_SIGNING_KEY, {
            issuer: env.JWT_ISSUER || 'AumoFinanceApp',
            audience: env.JWT_ISSUER || 'AumoFinanceApp',
        }) as JwtPayload;
    } catch {
        return null;
    }
}