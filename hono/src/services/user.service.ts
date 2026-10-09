import { eq } from "drizzle-orm";
// ISOLATED TOTAL: import { users } from "../db/schema";
const users = {} as any;
import { hashPasswordAspNet, verifyPasswordAspNet } from "../lib/auth";
// ISOLATED TOTAL: import { db } from "../lib/db";
const db = {} as any;
import type {
    GoogleAuthUserDTO,
    RegisterDTO,
    SafeUser,
    User,
} from "../types/user.type";

/**
 * Helper untuk menghapus passwordHash dari objek User sebelum dikembalikan ke client
 */
export function toSafeUser(user: User): SafeUser {
    const { passwordHash, ...safeUser } = user;
    return safeUser;
}

export const userService = {
    /**
     * Cari user berdasarkan Email
     */
    async findByEmail(email: string): Promise<User | null> {
        const result = await db
            .select()
            .from(users)
            .where(eq(users.email, email.toLowerCase()))
            .limit(1);

        return (result[0] as User) || null;
    },

    /**
     * Cari user berdasarkan ID
     */
    async findById(id: string): Promise<SafeUser | null> {
        const result = await db
            .select()
            .from(users)
            .where(eq(users.id, id))
            .limit(1);

        if (!result[0]) return null;
        return toSafeUser(result[0] as User);
    },

    /**
     * Service Registrasi Utama:
     * Cek duplikasi email sebelum melakukan hashing & inserasi ke DB.
     */
    async register(dto: RegisterDTO): Promise<SafeUser> {
        const existingUser = await this.findByEmail(dto.email);
        if (existingUser) {
            throw new Error("Email sudah terdaftar.");
        }

        return this.createUser(dto);
    },

    /**
     * Create User lokal baru dengan ASP.NET Identity Password Hasher
     */
    async createUser(dto: RegisterDTO): Promise<SafeUser> {
        const hashedPassword = hashPasswordAspNet(dto.password);

        const [newUser] = await db
            .insert(users)
            .values({
                email: dto.email.toLowerCase(),
                passwordHash: hashedPassword,
                name: dto.name ?? null,
                role: "user",
                createdAt: new Date(),
                updatedAt: new Date(),
            })
            .returning();

        return toSafeUser(newUser as User);
    },

    /**
     * Find or Create User via Google OAuth
     */
    async findOrCreateGoogleUser(dto: GoogleAuthUserDTO): Promise<SafeUser> {
        const existingUser = await this.findByEmail(dto.email);

        if (existingUser) {
            if (!existingUser.googleId) {
                const [updatedUser] = await db
                    .update(users)
                    .set({
                        googleId: dto.googleId,
                        avatarUrl: dto.avatarUrl ?? existingUser.avatarUrl,
                        updatedAt: new Date(),
                    })
                    .where(eq(users.id, existingUser.id))
                    .returning();

                return toSafeUser(updatedUser as User);
            }
            return toSafeUser(existingUser);
        }

        const [newUser] = await db
            .insert(users)
            .values({
                email: dto.email.toLowerCase(),
                passwordHash: "",
                name: dto.name ?? null,
                googleId: dto.googleId,
                avatarUrl: dto.avatarUrl ?? null,
                role: "user",
                createdAt: new Date(),
                updatedAt: new Date(),
            })
            .returning();

        return toSafeUser(newUser as User);
    },

    /**
     * Verifikasi kredensial user untuk proses login
     */
    async validateCredentials(email: string, password: string): Promise<SafeUser | null> {
        const user = await this.findByEmail(email);
        if (!user || !user.passwordHash) return null;

        const isValid = verifyPasswordAspNet(password, user.passwordHash);
        if (!isValid) return null;

        return toSafeUser(user);
    }
};