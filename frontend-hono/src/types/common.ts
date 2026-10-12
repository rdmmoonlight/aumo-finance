// src/types/common.ts

export type RootResponse = {
    status: string;
    message: string;
};

export type DatabaseHealthSuccessResponse = {
    status: "pass";
    timestamp: string;
    database: {
        status: "up";
        latency: string;
        name: string;
        serverTime: unknown | null;
    };
};

export type DatabaseHealthErrorResponse = {
    status: "fail";
    timestamp: string;
    database: {
        status: "down";
        error: string;
    };
};

export type HealthCheckResponse =
    | DatabaseHealthSuccessResponse
    | DatabaseHealthErrorResponse;

export type NotificationItem = {
    id: string;
    title?: string;
    message?: string;
    isRead?: boolean;
    createdAt?: string;
    [key: string]: unknown;
};

export type GetNotificationsArg = {
    limit?: number | string;
};

export type MarkNotificationReadArg = {
    id: string;
};

// Ini type generic, jadi kita jadiin yang utama di sini
export type CommonActionResponse = {
    success?: boolean;
    message?: string;
    [key: string]: unknown;
};