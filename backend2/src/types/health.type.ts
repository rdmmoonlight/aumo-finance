import { z } from 'zod';

export interface HealthStatus {
    status: 'Healthy' | 'Degraded' | 'Unhealthy';
    timestamp: Date;
    uptime?: number;
    version?: string;
}

export const healthStatusSchema = z.object({
    status: z.string(),
    timestamp: z.coerce.date()
});
