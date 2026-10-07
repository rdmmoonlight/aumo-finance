import { z } from 'zod';
import { parseJsonBody, sendJson } from '../lib/http.js';
import { UserService } from '../services/user.service.js';
import { Route } from '../types/route.types.js';

export const CreateUserSchema = z.object({
    name: z.string().min(3, 'Nama minimal 3 karakter'),
    email: z.string().email('Format email tidak valid'),
    age: z.number().int().min(17, 'Umur minimal 17 tahun').optional(),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;

export const userRoutes: Route[] = [
    {
        method: 'POST',
        path: '/users',
        handler: async (req, res) => {
            const body = await parseJsonBody<CreateUserInput>(req, CreateUserSchema);
            const newUser = await UserService.createUser(body);

            sendJson(res, 201, {
                message: 'User berhasil dibuat',
                data: newUser,
            });
        },
    },
    {
        method: 'GET',
        path: '/users',
        handler: async (_req, res) => {
            const users = await UserService.getUsers();
            sendJson(res, 200, { data: users });
        },
    },
];