import type { HealthStatus } from '../types/health.type.js';

// Pengganti IHealthService / HealthService C#
// C# cuma return Status = "Healthy" + Timestamp UtcNow

export class HealthService {
    async getHealthStatus(): Promise<HealthStatus> {
        return {
            status: 'Healthy',
            timestamp: new Date(),
            uptime: process.uptime(),
            version: process.env.npm_package_version || '1.0.0'
        };
    }
}

export const healthService = new HealthService();
