import { AuthService } from "@/services/auth";
import { createMiddleware } from "hono/factory";

// Menambahkan tipe user & session ke Context Hono
export type AuthEnv = {
  Variables: {
    user: NonNullable<Awaited<ReturnType<typeof AuthService.getSession>>>["user"];
    session: NonNullable<Awaited<ReturnType<typeof AuthService.getSession>>>["session"];
  };
};

export const requireAuth = createMiddleware<AuthEnv>(async (c, next) => {
  const sessionData = await AuthService.getSession(c);

  if (!sessionData || !sessionData.session) {
    return c.json(
      {
        success: false,
        message: "Unauthorized: Silakan login terlebih dahulu",
      },
      401
    );
  }

  // Simpan data user & session ke dalam konteks request Hono
  c.set("user", sessionData.user);
  c.set("session", sessionData.session);

  await next();
});