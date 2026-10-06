import http, { IncomingMessage, ServerResponse } from 'node:http';

const PORT = Number(process.env.PORT) || 5000;

const parseJsonBody = <T>(req: IncomingMessage): Promise<T> => {
  return new Promise((resolve, reject) => {
    let body = '';
    // Tambahkan tipe eksplisit untuk chunk
    req.on('data', (chunk: Buffer | string) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    // Tambahkan tipe eksplisit untuk err
    req.on('error', (err: Error) => reject(err));
  });
};

const server = http.createServer(async (req: IncomingMessage, res: ServerResponse) => {
  const method = req.method;
  const url = req.url;

  res.setHeader('Content-Type', 'application/json');

  if (method === 'GET' && url === '/') {
    res.writeHead(200);
    res.end(JSON.stringify({ message: 'Server Native TypeScript siap di Render!' }));
    return;
  }

  if (method === 'GET' && url === '/users') {
    res.writeHead(200);
    res.end(JSON.stringify({ users: [{ id: 1, name: 'Ghofur' }] }));
    return;
  }

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

  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Route tidak ditemukan' }));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server berjalan di http://0.0.0.0:${PORT}`);
});
