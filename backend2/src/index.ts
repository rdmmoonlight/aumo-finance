import http, { IncomingMessage, ServerResponse } from 'node:http';

const PORT = 5000;

// Helper kecil untuk membaca JSON body dari Stream request
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

// Buat HTTP Server
const server = http.createServer(async (req: IncomingMessage, res: ServerResponse) => {
  const method = req.method;
  const url = req.url;

  // Set default Header JSON
  res.setHeader('Content-Type', 'application/json');

  // --- ROUTER MANUAL ---

  // Route: GET /
  if (method === 'GET' && url === '/') {
    res.writeHead(200);
    res.end(JSON.stringify({ message: 'Server Native TypeScript Berhasil Jalan!' }));
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

  // Fallback: 404 Not Found
  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Route tidak ditemukan' }));
});

// Jalankan Server
server.listen(PORT, () => {
  console.log(`🚀 Server berjalan murni tanpa framework di http://localhost:${PORT}`);
});
      
