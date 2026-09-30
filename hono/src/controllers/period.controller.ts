import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { CreatePeriodSchema } from '../dtos/period.dto.js';
import { PeriodService } from '../services/period.service.js';
import { PeriodRepository } from '../repositories/period.repository.js';

export const periodController = new Hono();

const repo = new PeriodRepository();
const service = new PeriodService(repo);

periodController.post('/', zValidator('json', CreatePeriodSchema), async (c) => {
  // Simulasi Ambil userId dari JWT / Auth Context
  const userId = c.req.header('x-user-id') || 'guest-user';
  const dto = c.req.valid('json');

  try {
    const result = await service.createPeriod(userId, dto);
    return c.json({ success: true, data: result }, 201);
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 400);
  }
});
