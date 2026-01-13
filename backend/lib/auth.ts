import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import { getSaoPauloDate } from "@/lib/utils";


export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async signIn({ user, account, profile }) {
            const email = user.email;
            if (!email) return false;

            const domain = email.split("@")[1];
            const allowedDomain = process.env.ALLOWED_EMAIL_DOMAIN;

            if (allowedDomain && domain !== allowedDomain) {
                console.warn(`[AUTH] Access denied for domain: ${domain}`);
                return false;
            }

            try {
                await prisma.logAcesso.create({
                    data: {
                        emailUsuario: email,
                        userAgent: "NextAuth Login",
                        ipAddress: "Unknown",
                        dataAcesso: getSaoPauloDate(),
                    },
                });
                console.log(`[AUTH] Login logged for: ${email}`);
            } catch (error) {
                console.error("[AUTH] Failed to log access:", error);
            }

            return true;
        },
        async session({ session, token }) {
            return session;
        },
        async jwt({ token, user }) {
            return token;
        }
    },
    pages: {
        signIn: "/login",
        error: "/login",
    },
    debug: process.env.NODE_ENV === "development",
};
