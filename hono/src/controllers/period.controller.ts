import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { CreatePeriodSchema } from '../dtos/period.dto.js';
import { PeriodService } from '../services/period.service.js';
import { PeriodRepository } from '../repositories/period.repository.js';

export const periodController = new Hono();

const repo = new PeriodRepository();
const service = new PeriodService(repo);

// GET: /api/v1/periods
periodController.get('/', async (c) => {
  const userId = c.req.header('x-user-id');
  if (!userId) {
    return c.json({ success: false, message: 'User ID is required in header (x-user-id)' }, 401);
  }

  try {
    const periods = await service.getPeriods(userId);
    return c.json({ success: true, periods });
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

// POST: /api/v1/periods
periodController.post('/', zValidator('json', CreatePeriodSchema), async (c) => {
  const userId = c.req.header('x-user-id');
  if (!userId) {
    return c.json({ success: false, message: 'User ID is required in header (x-user-id)' }, 401);
  }

  const dto = c.req.valid('json');

  try {
    const result = await service.createPeriod(userId, dto);
    return c.json({ success: true, data: result }, 201);
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 400);
  }
});
  
