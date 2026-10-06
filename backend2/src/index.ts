import http, { IncomingMessage, ServerResponse } from 'node:http';

// Gunakan port dari environment Render, fallback ke 5000 untuk lokal
const PORT = Number(process.env.PORT) || 5000;

// Helper membaca JSON body dari stream
const parseJsonBody = <T>(req: IncomingMessage): Promise<T> => {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', (err) => reject(err));
  });
};

// Server HTTP native
const server = http.createServer(async (req: IncomingMessage, res: ServerResponse) => {
  const method = req.method;
  const url = req.url;

  res.setHeader('Content-Type', 'application/json');

  // Route: GET /
  if (method === 'GET' && url === '/') {
    res.writeHead(200);
    res.end(JSON.stringify({ message: 'Server Native TypeScript siap di Render!' }));
    return;
  }

  // Route: GET /users
  if (method === 'GET' && url === '/users') {
    res.writeHead(200);
    res.end(JSON.stringify({ users: [{ id: 1, name: 'Ghofur' }] }));
    return;
  }

  // Route: POST /users
  if (method === 'POST' && url === '/users') {
    try {
      const body = await parseJsonBody<{ name: string }>(req);

      if (!body.name) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Nama wajib diisi' }));
        return;
      }

      res.writeHead(201);
      res.end(JSON.stringify({ message: 'User berhasil dibuat', data: body }));
    } catch (error) {
      res.writeHead(400);
      res.end(JSON.stringify({ error: 'Format JSON tidak valid' }));
    }
    return;
  }

  // 404 Not Found
  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Route tidak ditemukan' }));
});

// Dengarkan pada '0.0.0.0' wajib untuk Web Service di Render
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server berjalan di http://0.0.0.0:${PORT}`);
});
