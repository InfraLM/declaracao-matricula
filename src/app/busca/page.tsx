"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Search, Loader2, ChevronRight, User } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import Link from "next/link";
import { BASE_PATH } from "@/lib/utils";

interface Student {
    "Nome Completo": string;
    "CPF": string;
    "Situação Cadastral": string;
    "Curso": string;
    "Turma"?: string;
    "TURMA"?: string;
    sourceSheet?: string;
}

export default function BuscaPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [query, setQuery] = useState("");
    const debouncedQuery = useDebounce(query, 500);
    const [results, setResults] = useState<Student[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    useEffect(() => {
        async function fetchStudents() {
            if (!debouncedQuery || debouncedQuery.length < 3) {
                setResults([]);
                setHasSearched(false);
                return;
            }

            setIsLoading(true);
            try {
                const res = await fetch(`${BASE_PATH}/api/students/search?q=${encodeURIComponent(debouncedQuery)}`);
                const data = await res.json();
                if (data.data) {
                    setResults(data.data);
                }
            } catch (error) {
                console.error("Failed to fetch students", error);
            } finally {
                setIsLoading(false);
                setHasSearched(true);
            }
        }

        fetchStudents();
    }, [debouncedQuery]);

    if (status === "loading") {
        return (
            <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Autenticando...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="mb-12">
                <h1 className="text-4xl font-light tracking-tighter text-gray-900 sm:text-5xl">
                    Busca de <span className="font-bold text-primary">Alunos</span>
                </h1>
                <p className="mt-4 text-sm font-medium text-gray-400 uppercase tracking-widest">
                    Consulte registros e emita declarações instantâneas
                </p>
            </div>

            {/* Search Input Section */}
            <div className="relative mb-16 max-w-2xl group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-300 group-focus-within:text-primary transition-colors" />
                <input
                    type="text"
                    placeholder="Pesquisar por nome ou CPF..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full pl-16 pr-6 py-6 bg-white border-2 border-gray-100 rounded-2xl text-lg font-light tracking-tight focus:border-primary focus:ring-0 transition-all shadow-sm hover:shadow-md outline-none"
                    autoFocus
                />
            </div>

            {/* Results Section */}
            <div className="space-y-6">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Processando base de dados...</p>
                    </div>
                ) : results.length === 0 && hasSearched ? (
                    <div className="text-center py-20 border-2 border-dashed border-gray-100 rounded-3xl animate-in zoom-in-95 duration-300">
                        <User className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                        <p className="text-gray-400 font-light">Nenhum aluno encontrado para "{debouncedQuery}".</p>
                    </div>
                ) : results.length > 0 ? (
                    <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm animate-in slide-in-from-bottom-4 duration-500">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Aluno</th>
                                    <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 hidden md:table-cell">CPF</th>
                                    <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 hidden lg:table-cell">Turma</th>
                                    <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Status</th>
                                    <th className="px-8 py-5 text-right"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {results.map((student, idx) => {
                                    const status = student['Situação Cadastral'];
                                    const isDistrato = status === 'DISTRATO';
                                    const isTrancado = status === 'TRANCADO';

                                    return (
                                        <tr key={idx} className="group hover:bg-gray-50/50 transition-colors">
                                            <td className="px-8 py-6">
                                                <div className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                                                    {student['Nome Completo']}
                                                </div>
                                                <div className="text-xs text-gray-400 mt-0.5">{student['Curso'] || student.sourceSheet}</div>
                                            </td>
                                            <td className="px-8 py-6 text-sm text-gray-500 hidden md:table-cell tabular-nums">
                                                {student['CPF']}
                                            </td>
                                            <td className="px-8 py-6 text-sm text-gray-500 hidden lg:table-cell">
                                                {student['Turma'] || student['TURMA'] || student.sourceSheet}
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${isDistrato ? 'bg-red-50 text-red-600 border border-red-100' :
                                                    isTrancado ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                                        'bg-green-50 text-green-600 border border-green-100'
                                                    }`}>
                                                    {status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right px-8">
                                                <Link
                                                    href={`/aluno/${student['CPF']?.replace(/\D/g, '')}`}
                                                    className={`inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-all ${isDistrato ? 'text-gray-300 pointer-events-none' : 'text-gray-900 hover:text-primary active:scale-95'
                                                        }`}
                                                >
                                                    Visualizar
                                                    <ChevronRight className="h-4 w-4" />
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-sm font-medium text-gray-300 uppercase tracking-[0.3em]">Aguardando busca...</p>
                    </div>
                )}
            </div>
        </div>
    );
}
