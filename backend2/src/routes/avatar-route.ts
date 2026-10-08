import type { Context } from 'hono';
import { neonBucketStorage } from '../lib/neon-bucket-storage.js';

export async function getAvatarHandler(c: Context) {
    const fileName = c.req.param('fileName');

    if (!fileName) {
        return c.json({ message: 'fileName required' }, 400);
    }

    if (!neonBucketStorage.isConfigured) {
        return c.json({ message: 'Avatar storage not configured' }, 500);
    }

    const avatar = await neonBucketStorage.getAvatar(fileName);

    if (!avatar) {
        return c.json({ message: 'Avatar not found' }, 404);
    }

    // Set content type dan cache
    c.header('Content-Type', avatar.contentType);
    c.header('Cache-Control', 'public, max-age=31536000, immutable'); // 1 year
    c.header('Content-Disposition', `inline; filename="${fileName}"`);

    // Stream response - Hono support ReadableStream
    if (avatar.stream instanceof ReadableStream) {
        return new Response(avatar.stream, {
            headers: {
                'Content-Type': avatar.contentType,
                'Cache-Control': 'public, max-age=31536000, immutable'
            }
        });
    }

    // Node.js Readable to Web Readable
    return c.body(avatar.stream as any, 200, {
        'Content-Type': avatar.contentType,
        'Cache-Control': 'public, max-age=31536000, immutable'
    });
}

// Untuk dipakai di Hono app:
// app.get('/api/v1/avatars/:fileName', getAvatarHandler);
