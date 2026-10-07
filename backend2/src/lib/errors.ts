import { ZodError } from 'zod';

export class ValidationError extends Error {
    public errors: Record<string, string[]>;

    constructor(zodError: ZodError) {
        super('Validation Error');
        this.name = 'ValidationError';
        this.errors = zodError.flatten().fieldErrors as Record<string, string[]>;
    }
}