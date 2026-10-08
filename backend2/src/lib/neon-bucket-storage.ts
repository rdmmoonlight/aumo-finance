import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { env } from './env.js';
import { logger } from './logger.js';

// Pengganti AvatarObject record di C#
export interface AvatarObject {
    stream: ReadableStream | NodeJS.ReadableStream | any;
    contentType: string;
}

// Pengganti IAvatarStorage di C#
export interface IAvatarStorage {
    readonly isConfigured: boolean;
    uploadAvatar(fileName: string, content: Buffer | Uint8Array | ReadableStream | any): Promise<string>;
    getAvatar(fileName: string): Promise<AvatarObject | null>;
}

const KEY_PREFIX = 'avatars/';
const FILE_NAME_PATTERN = /^[A-Za-z0-9_\-]+\.(jpg|jpeg|png|gif|webp)$/i;

function contentTypeFor(fileName: string): string {
    const ext = fileName.toLowerCase().split('.').pop();
    switch (ext) {
        case 'jpg':
        case 'jpeg':
            return 'image/jpeg';
        case 'png':
            return 'image/png';
        case 'gif':
            return 'image/gif';
        case 'webp':
            return 'image/webp';
        default:
            return 'application/octet-stream';
    }
}

function ensureValidFileName(fileName: string) {
    if (!FILE_NAME_PATTERN.test(fileName)) {
        throw new Error(`Nama file avatar tidak valid: ${fileName}. Harus alphanumeric + _- dan ext jpg/jpeg/png/gif/webp`);
    }
}

function buildPublicUrl(fileName: string, requestHost?: string): string {
    // C#: _configuration["PUBLIC_API_URL"] ?? HttpContext.Request.Scheme://Host
    // TS: env.PUBLIC_API_URL atau fallback dari request
    let baseUrl = env.PUBLIC_API_URL || process.env.PUBLIC_API_URL;

    if (!baseUrl) {
        if (requestHost) {
            baseUrl = requestHost.startsWith('http') ? requestHost : `https://${requestHost}`;
        } else {
            // Fallback untuk dev - harus set PUBLIC_API_URL di prod
            if (process.env.NODE_ENV === 'production') {
                throw new Error('Set PUBLIC_API_URL: konteks HTTP tidak tersedia untuk membentuk URL avatar.');
            }
            baseUrl = 'http://localhost:3000';
        }
    }

    return `${baseUrl.replace(/\/$/, '')}/api/v1/avatars/${fileName}`;
}

export class NeonBucketStorage implements IAvatarStorage {
    private readonly bucket: string;
    private readonly client: S3Client | null;

    constructor() {
        const endpoint = env.AWS_ENDPOINT_URL_S3 || process.env.AWS_ENDPOINT_URL_S3;
        const accessKey = env.AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
        const secretKey = env.AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;
        const region = env.AWS_REGION || process.env.AWS_REGION || 'ap-southeast-1';
        this.bucket = env.S3_BUCKET || process.env.S3_BUCKET || 'assets';

        if (!endpoint || !accessKey || !secretKey) {
            logger.warn("Peringatan: 'AWS_ENDPOINT_URL_S3', 'AWS_ACCESS_KEY_ID' atau 'AWS_SECRET_ACCESS_KEY' belum dikonfigurasi. Upload avatar dinonaktifkan.");
            this.client = null;
            return;
        }

        this.client = new S3Client({
            region,
            endpoint,
            forcePathStyle: true,
            credentials: {
                accessKeyId: accessKey,
                secretAccessKey: secretKey
            },
            // Penyimpanan S3-compatible tidak selalu mendukung checksum tambahan SDK terbaru.
            requestChecksumCalculation: 'WHEN_REQUIRED' as any,
            responseChecksumValidation: 'WHEN_REQUIRED' as any
        });
    }

    get isConfigured(): boolean {
        return this.client !== null;
    }

    private requireClient(): S3Client {
        if (!this.client) {
            throw new Error('Neon bucket belum dikonfigurasi di server.');
        }
        return this.client;
    }

    async uploadAvatar(fileName: string, content: Buffer | Uint8Array | ReadableStream | any, requestHost?: string): Promise<string> {
        const client = this.requireClient();
        ensureValidFileName(fileName);

        const body = content instanceof Buffer ? content : content instanceof Uint8Array ? content : content;

        await client.send(new PutObjectCommand({
            Bucket: this.bucket,
            Key: KEY_PREFIX + fileName,
            Body: body as any,
            ContentType: contentTypeFor(fileName)
        }));

        return buildPublicUrl(fileName, requestHost);
    }

    async getAvatar(fileName: string): Promise<AvatarObject | null> {
        const client = this.requireClient();
        if (!FILE_NAME_PATTERN.test(fileName)) return null;

        try {
            const response = await client.send(new GetObjectCommand({
                Bucket: this.bucket,
                Key: KEY_PREFIX + fileName
            }));

            return {
                stream: response.Body as any,
                contentType: contentTypeFor(fileName)
            };
        } catch (err: any) {
            // C#: catch AmazonS3Exception when StatusCode == NotFound
            const status = err?.$metadata?.httpStatusCode || err?.statusCode;
            const name = err?.name || err?.Code;
            if (status === 404 || name === 'NoSuchKey' || name === 'NotFound') {
                return null;
            }
            logger.error({ err, fileName }, 'Failed to get avatar from bucket');
            throw err;
        }
    }
}

// Singleton sama seperti DI di C#
export const neonBucketStorage = new NeonBucketStorage();

// Alias untuk backward compat dengan kode lama yang pakai avatarStorage
export const avatarStorage: IAvatarStorage = neonBucketStorage;
