"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { LogOut, User } from "lucide-react";

export function Navbar() {
    const { data: session } = useSession();

    if (!session) return null;

    return (
        <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex items-center gap-4">
                        <Link href="/busca" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                            <Image
                                src="/assets/liberdade_medica_logo.webp"
                                alt="Liberdade Médica"
                                width={120}
                                height={40}
                                className="object-contain"
                            />
                        </Link>
                        <div className="h-6 w-[1px] bg-gray-200 hidden sm:block" />
                        <span className="text-sm font-light text-gray-500 hidden sm:block uppercase tracking-widest">
                            SOP - Matrícula
                        </span>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-100">
                            <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-white">
                                <User size={14} />
                            </div>
                            <span className="text-xs font-medium text-gray-700 hidden md:block">
                                {session.user?.email}
                            </span>
                        </div>
                        <button
                            onClick={() => signOut({ callbackUrl: "/login" })}
                            className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary transition-colors group"
                        >
                            <span className="hidden sm:inline">Sair</span>
                            <LogOut size={18} className="group-hover:translate-x-0.5 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
