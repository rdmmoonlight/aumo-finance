import { IncomingMessage, ServerResponse } from "node:http";
import { z } from "zod";
import { ValidationError } from "./errors.js";

/**
 * Kirim response format JSON beserta status code dan kustom headers
 */
export const sendJson = (
    res: ServerResponse,
    statusCode: number,
    data: unknown,
    headers: Record<string, string | string[]> = {}
): void => {
    res.writeHead(statusCode, {
        "Content-Type": "application/json",
        ...headers,
    });
    res.end(JSON.stringify(data));
};

/**
 * Parse JSON body dari request stream dan validasi menggunakan Zod schema (opsional)
 */
export const parseJsonBody = <T>(
    req: IncomingMessage,
    schema?: z.ZodType<T>
): Promise<T> => {
    return new Promise((resolve, reject) => {
        let body = "";

        req.on("data", (chunk: Buffer | string) => {
            body += chunk.toString();
        });

        req.on("end", async () => {
            try {
                const parsedJson = body ? JSON.parse(body) : {};

                if (schema) {
                    const result = await schema.safeParseAsync(parsedJson);
                    if (!result.success) {
                        return reject(new ValidationError(result.error));
                    }
                    return resolve(result.data);
                }

                resolve(parsedJson as T);
            } catch (err) {
                if (err instanceof ValidationError) {
                    reject(err);
                } else {
                    reject(new Error("Format JSON tidak valid"));
                }
            }
        });

        req.on("error", (err: Error) => reject(err));
    });
};

/**
 * Helper untuk membaca Cookie dari header request
 */
export const parseCookies = (req: IncomingMessage): Record<string, string> => {
    const list: Record<string, string> = {};
    const cookieHeader = req.headers.cookie;

    if (!cookieHeader) return list;

    cookieHeader.split(";").forEach((cookie) => {
        const [name, ...rest] = cookie.split("=");
        if (name) {
            list[name.trim()] = decodeURIComponent(rest.join("=").trim());
        }
    });

    return list;
};