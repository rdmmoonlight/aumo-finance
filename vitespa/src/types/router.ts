import type { Match } from 'navigo';
// Definisi tipe Route Result
export type RouteResult = {
    html: string;
    setupEvents?: () => void;
};

export interface RouteContext {
    match?: Match;
    redirectUrl?: string;
}

export type Middleware = (context: RouteContext) => boolean | Promise<boolean>;

export type RouteHandler = (match?: Match) => {
    html: string;
    setupEvents?: () => void;
};

export interface RouteConfig {
    handler: RouteHandler;
    middlewares?: Middleware[];
}

export interface RouteContext {
    match?: Match;
    redirectUrl?: string;
}