import { Hono } from 'hono';
import { z } from 'zod';
import { parseBody } from '../lib/http.js';
import { userService } from '../services/user.service.js';
import type { AppEnv } from '../types/app.types.js';

export const CreateUserSchema = z.object({
  name: z.string().min(3, 'Nama minimal 3 karakter'),
  email: z.string().email('Format email tidak valid'),
  age: z.number().int().min(17, 'Umur minimal 17 tahun').optional(),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;

export const userRoutes = new Hono<AppEnv>()
  .post('/', async (c) => {
    const body = await parseBody<CreateUserInput>(c, CreateUserSchema);
    const newUser = await userService.createUser(body);

    return c.json({ message: 'User berhasil dibuat', data: newUser }, 201);
  })
  .get('/', (c) => c.json({ data: [] }));
