// /app/auth.ts

import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { saltAndHashPassword } from "@/lib/utils"
import { User } from "@/app/types";
import { getUserFromDb } from "@/lib/db";
import { signInSchema } from '@/lib/zod';
import { ZodError } from 'zod';
import NeonAdapter from "@auth/neon-adapter";
import { Pool } from "@neondatabase/serverless";
import bcrypt from 'bcrypt';
import { AdapterUser } from "next-auth/adapters";

declare module 'next-auth' {
    interface Session {
        user: User & Partial<AdapterUser>
    }
    interface User {
        is_admin: boolean;
    }
    interface JWT {
        id: string;
        is_admin: boolean;
    }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
    session: {
        strategy: "jwt", // Explicitly use JWT
    },
    providers: [
        Credentials({
            credentials: {
                email: {},
                password: {},
            },
            authorize: async (credentials) => {
                try {
                    const { email, password } = await signInSchema.parseAsync(credentials);

                    let user = await getUserFromDb(email);

                    if (!user) {
                        throw new Error("User not found");
                    }

                    const passwordsMatch = await bcrypt.compare(password, user.password);

                    if (!passwordsMatch) {
                        throw new Error("Invalid password");
                    }

                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        is_admin: user.is_admin,
                    } as User;
                }
                catch (error) {
                    if (error instanceof ZodError) {
                        return null;
                    }
                    return null;
                }
            }
        })
    ],
    callbacks: {
        jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.is_admin = user.is_admin;
            }
            return token;
        },
        session({ session, token }) {
            if (token) {
                session.user.id = token.id as string;
                session.user.is_admin = token.is_admin as boolean;
            }
            return session;
        },
    },
});