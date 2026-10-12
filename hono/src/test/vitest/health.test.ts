import { describe, it, expect } from 'vitest';
import { healthRoute } from './health'; // Sesuaikan lokasi impor healthRoute

describe('Health Routes', () => {
  it('GET / - harus mengembalikan status 200 dan pesan server online', async () => {
    const res = await healthRoute.request('/');

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({
      status: 'ok',
      message: 'AumoBackend API Server Online 🚀',
    });
  });

  it('HEAD / - harus mengembalikan status 200 dengan body kosong (Ping)', async () => {
    const res = await healthRoute.request('/', { method: 'HEAD' });

    expect(res.status).toBe(200);
    const bodyText = await res.text();
    expect(bodyText).toBe('');
  });

  it('GET /health - harus mengembalikan status 200 dan timestamp valid', async () => {
    const res = await healthRoute.request('/health');

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('pass');
    expect(body).toHaveProperty('timestamp');
    expect(isNaN(Date.parse(body.timestamp))).toBe(false);
  });
});
