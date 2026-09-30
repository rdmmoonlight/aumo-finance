import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { periodController } from './controllers/period.controller.js';

const app = new Hono();

// Mount Routes
app.route('/api/v1/periods', periodController);

app.get('/', (c) => {
  return c.text('Aumo Hono Backend Service is Running!');
});

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
