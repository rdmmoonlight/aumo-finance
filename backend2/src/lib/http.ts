import { IncomingMessage, ServerResponse } from 'node:http';
import { z } from 'zod';
import { ValidationError } from './errors.js';

export const sendJson = (res: ServerResponse, statusCode: number, data: unknown) => {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
};

export const parseJsonBody = <T>(
    req: IncomingMessage,
    schema?: z.ZodType<T>
): Promise<T> => {
    return new Promise((resolve, reject) => {
        let body = '';

        req.on('data', (chunk: Buffer | string) => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            try {
                const parsedJson = body ? JSON.parse(body) : {};

                // Jika schema disediakan, validasi menggunakan Zod
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
                    reject(new Error('Format JSON tidak valid'));
                }
            }
        });

        req.on('error', (err: Error) => reject(err));
    });
};