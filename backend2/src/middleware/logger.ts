import pinoHttp from 'pino-http';
import { logger } from '../lib/logger.js';

export const httpLogger = pinoHttp({
    logger,
    // Custom log pas request masuk
    customReceivedMessage: (req) => `--> [IN] ${req.method} ${req.url}`,
    // Custom log pas response keluar
    customSuccessMessage: (req, res, responseTime) =>
        `<-- [OUT] ${req.method} ${req.url} ${res.statusCode} (${responseTime}ms)`,
    customErrorMessage: (req, res, error) =>
        `<-- [ERROR] ${req.method} ${req.url} ${res.statusCode} - ${error.message}`,
    // Sensor header sensitif biar gak bocor di log
    redact: {
        paths: ['req.headers.authorization', 'req.headers.cookie'],
        remove: true,
    },
});