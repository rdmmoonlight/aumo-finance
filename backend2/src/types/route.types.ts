import type { IncomingMessage, ServerResponse } from "node:http";

export type RouteHandler = (
    req: IncomingMessage,
    res: ServerResponse
) => void | Promise<void>;

export interface RouteOpenApiSpec {
    summary?: string;
    description?: string;
    tags?: string[];
    responses?: Record<string, { description: string; content?: Record<string, unknown> }>;
}

export interface Route {
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    path: string;
    handler: RouteHandler;
    openapi?: RouteOpenApiSpec; // Integrasi opsional untuk Scalar/OpenAPI
}