"use client";

import { signIn } from "next-auth/react";
import Image from "next/image";
import { useState, Suspense } from "react";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";

function LoginForm() {
    const [isLoading, setIsLoading] = useState(false);
    const searchParams = useSearchParams();
    const error = searchParams.get("error");

    const handleLogin = async () => {
        setIsLoading(true);
        try {
            await signIn("google", { callbackUrl: "/busca" });
        } catch (error) {
            console.error("Login failed", error);
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md z-10 space-y-12 px-8">
            {/* LOGO AREA */}
            <div className="flex flex-col items-center text-center">
                <div className="mb-8 transform hover:scale-105 transition-transform duration-300">
                    <Image
                        src="/assets/liberdade_medica_logo.webp"
                        alt="Liberdade Médica"
                        width={180}
                        height={60}
                        className="object-contain"
                        priority
                    />
                </div>
                <div className="space-y-2">
                    <h2 className="text-3xl font-light tracking-tighter text-gray-900 sm:text-4xl">
                        SOP <span className="font-bold text-primary">Matrícula</span>
                    </h2>
                    <p className="text-sm font-medium text-gray-400 uppercase tracking-widest">
                        Portal Interno de Declarações
                    </p>
                </div>
            </div>

            {/* ERROR MESSAGE */}
            {error === "AccessDenied" && (
                <div className="rounded-lg border border-red-100 bg-red-50/50 p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <p className="text-xs font-semibold text-red-600 text-center uppercase tracking-wider">
                        Acesso não autorizado
                    </p>
                    <p className="mt-1 text-sm text-red-700 text-center">
                        Utilize exclusivamente seu e-mail @liberdademedicaedu.com.br
                    </p>
                </div>
            )}

            {/* LOGIN BUTTON */}
            <div className="pt-4">
                <button
                    onClick={handleLogin}
                    disabled={isLoading}
                    className="group relative flex w-full items-center justify-center overflow-hidden rounded-full bg-black px-8 py-4 text-sm font-bold text-white transition-all hover:bg-gray-900 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                >
                    {/* Decorative red flash on hover */}
                    <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-10 transition-opacity" />

                    {isLoading ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                        <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                        </svg>
                    )}
                    <span className="relative">
                        {isLoading ? "Validando acesso..." : "Entrar com Google Workspace"}
                    </span>
                </button>
            </div>

            {/* FOOTER */}
            <div className="text-center">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-300">
                    Liberdade Médica &copy; {new Date().getFullYear()}
                </p>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-white relative overflow-hidden">
            {/* Minimalist Background Grid */}
            <div className="absolute inset-0 z-0 opacity-[0.03]"
                style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '40px 40px' }}
            />

            <Suspense fallback={
                <div className="flex flex-col items-center justify-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
                </div>
            }>
                <LoginForm />
            </Suspense>
        </div>
    );
}
