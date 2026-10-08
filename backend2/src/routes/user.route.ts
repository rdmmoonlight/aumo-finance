import { Hono } from 'hono';
import { parseBody } from '../lib/http.js';
import { userService } from '../services/user.service.js';
import type { AppEnv } from '../types/app.types.js';

export const userRoutes = new Hono<AppEnv>()
  .post('/', async (c) => {
    const body = await parseBody<CreateUserInput>(c, CreateUserSchema);
    const newUser = await userService.createUser(body);

    return c.json({ message: 'User berhasil dibuat', data: newUser }, 201);
  })
  .get('/', (c) => c.json({ data: [] }));
