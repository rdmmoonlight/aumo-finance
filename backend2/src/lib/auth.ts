import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";
import { env } from "./env.js";
import { parseCookies, sendJson } from "./http.js";

export interface TokenPayload {
    userId: string;
    email: string;
    role?: string;
}

/**
 * ASP.NET Identity V3 Password Hasher
 */
export function hashPasswordAspNet(password: string): string {
    const salt = crypto.randomBytes(16);
    const bytes = crypto.pbkdf2Sync(password, salt, 10000, 32, "sha256");

    const output = Buffer.alloc(1 + 4 + 4 + 4 + 16 + 32);
    output.writeUInt8(0x01, 0); // Format V3
    output.writeUInt32BE(1, 1); // KeyDerivationPrf.HMACSHA256 (1)
    output.writeUInt32BE(10000, 5); // Iterations
    output.writeUInt32BE(16, 9); // Salt size
    salt.copy(output, 13);
    bytes.copy(output, 29);

    return output.toString("base64");
}

export function verifyPasswordAspNet(password: string, hashedPasswordBase64: string): boolean {
    try {
        const decoded = Buffer.from(hashedPasswordBase64, "base64");
        if (decoded.length < 1 + 4 + 4 + 4 + 16 + 32) return false;

        const prf = decoded.readUInt32BE(1);
        const iterCount = decoded.readUInt32BE(5);
        const saltLength = decoded.readUInt32BE(9);

        if (prf !== 1 || iterCount !== 10000 || saltLength !== 16) return false;

        const salt = decoded.subarray(13, 13 + saltLength);
        const expectedSubkey = decoded.subarray(13 + saltLength, 13 + saltLength + 32);

        const actualSubkey = crypto.pbkdf2Sync(password, salt, iterCount, 32, "sha256");

        return crypto.timingSafeEqual(expectedSubkey, actualSubkey);
    } catch {
        return false;
    }
}

/**
 * JWT Helpers
 */
export function signJwt(payload: TokenPayload, expiresIn: string = "7d"): string {
    return jwt.sign(payload, env.JWT_SIGNING_KEY, {
        expiresIn,
        issuer: env.JWT_ISSUER,
    });
}

export function verifyJwt(token: string): TokenPayload | null {
    try {
        return jwt.verify(token, env.JWT_SIGNING_KEY, {
            issuer: env.JWT_ISSUER,
        }) as TokenPayload;
    } catch {
        return null;
    }
}

/**
 * Verification Guard for Native Node HTTP
 */
export interface AuthenticatedRequest extends IncomingMessage {
    user?: TokenPayload;
}

export function verifyAuth(req: AuthenticatedRequest, res: ServerResponse): TokenPayload | null {
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
    } else {
        const cookies = parseCookies(req);
        token = cookies["access_token"];
    }

    if (!token) {
        sendJson(res, 401, { message: "Unauthorized" });
        return null;
    }

    const payload = verifyJwt(token);
    if (!payload) {
        sendJson(res, 401, { message: "Invalid or expired token" });
        return null;
    }

    req.user = payload;
    return payload;
}