import { Route } from '../types/route.types';

export const healthRoutes: Route[] = [
    {
        method: 'GET',
        path: '/',
        handler: (req, res) => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'API berjalan lancar 🚀' }));
        },
    },
    {
        method: 'GET',
        path: '/health',
        handler: (req, res) => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ status: 'ok', uptime: process.uptime() }));
        },
    },
];