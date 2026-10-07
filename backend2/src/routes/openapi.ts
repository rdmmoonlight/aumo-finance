// src/routes/openapi.ts
export const openApiSpec = {
    openapi: "3.0.0",
    info: {
        title: "Aumo Backend API",
        version: "3.2.0",
        description: "Dokumentasi API Aumo Backend",
    },
    paths: {
        "/health": {
            get: {
                summary: "Cek kesehatan server",
                responses: {
                    "200": { description: "Server berjalan normal" },
                },
            },
        },
        "/users": {
            get: {
                summary: "Ambil daftar user",
                responses: {
                    "200": { description: "Berhasil mengambil data user" },
                },
            },
        },
    },
};