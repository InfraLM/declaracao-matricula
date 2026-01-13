"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";
import { ArrowLeft, FileText, Loader2, AlertCircle, Calendar, Mail, Phone, GraduationCap, Clock } from "lucide-react";
import Link from "next/link";
import { BASE_PATH } from "@/lib/utils";

interface Student {
    "Nome Completo": string;
    "CPF": string;
    "Situação Cadastral": string;
    "Curso": string;
    "Data de Nascimento": string;
    "E-mail": string;
    "Telefone": string;
    "Data da Matrícula": string;
    sourceSheet?: string;
    [key: string]: any;
}

export default function StudentProfilePage({ params }: { params: Promise<{ cpf: string }> }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const unwrappedParams = use(params);
    const cpfParam = unwrappedParams.cpf;

    const [student, setStudent] = useState<Student | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [showWarning, setShowWarning] = useState(false);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    useEffect(() => {
        if (!cpfParam) return;

        async function fetchStudent() {
            try {
                const res = await fetch(`${BASE_PATH}/api/students/${cpfParam}`);
                if (!res.ok) throw new Error("Student not found");
                const data = await res.json();
                setStudent(data.data);
            } catch (err) {
                setError("Aluno não encontrado ou erro na busca.");
            } finally {
                setIsLoading(false);
            }
        }

        if (status === "authenticated") {
            fetchStudent();
        }
    }, [cpfParam, status]);

    const handleGenerateDeclaration = async (force = false) => {
        if (!student) return;

        if (student['Situação Cadastral'] !== 'ATIVO' && !force) {
            setShowWarning(true);
            return;
        }

        setIsGenerating(true);
        setShowWarning(false);

        try {
            const res = await fetch(`${BASE_PATH}/api/students/${cpfParam}/generate`, {
                method: 'POST',
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Erro ao gerar PDF");
            }

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Declaracao_Matricula_${student['Nome Completo'].replace(/\s+/g, '_')}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err: any) {
            alert(err.message || "Erro ao gerar documento");
        } finally {
            setIsGenerating(false);
        }
    };

    if (status === "loading" || isLoading) {
        return (
            <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Carregando perfil...</p>
            </div>
        );
    }

    if (error || !student) {
        return (
            <div className="flex h-[80vh] flex-col items-center justify-center gap-6 animate-in fade-in duration-500">
                <div className="bg-red-50 p-4 rounded-full">
                    <AlertCircle className="h-12 w-12 text-red-500" />
                </div>
                <div className="text-center">
                    <p className="text-xl font-bold text-gray-900">{error || "Aluno não encontrado"}</p>
                    <p className="text-sm text-gray-500 mt-1">Verifique o CPF digitado e tente novamente.</p>
                </div>
                <button
                    onClick={() => router.push('/busca')}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-full text-sm font-bold hover:bg-gray-900 transition-all active:scale-95"
                >
                    <ArrowLeft size={16} />
                    Voltar para busca
                </button>
            </div>
        );
    }

    const dataFimPdf = (() => {
        const turma = (student["Turma"] || student["TURMA"] || "").toUpperCase();
        const matricula = student["Data da matrícula"] || student["Data da Matrícula"] || student["DATA DE MATRÍCULA"];
        if (turma.includes("5B")) return "01/05/2025";
        if (turma.includes("5A") || turma.includes("TURMA 5")) return "01/02/2025";
        return matricula || "-";
    })();

    const isDistrato = student['Situação Cadastral'] === 'DISTRATO';

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Nav & Action Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
                <Link
                    href="/busca"
                    className="group flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-gray-400 hover:text-primary transition-colors"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    Voltar para busca
                </Link>

                <button
                    onClick={() => handleGenerateDeclaration()}
                    disabled={isGenerating || isDistrato}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-full bg-black px-8 py-4 text-sm font-bold text-white shadow-xl hover:bg-gray-900 active:scale-95 disabled:opacity-20 disabled:pointer-events-none transition-all group overflow-hidden relative"
                >
                    <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-10 transition-opacity" />
                    {isGenerating ? <Loader2 className="animate-spin h-5 w-5" /> : <FileText className="h-5 w-5 text-primary" />}
                    <span className="relative">
                        {isGenerating ? 'Processando Documento...' : 'Gerar Declaração de Matrícula'}
                    </span>
                </button>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Profile Card Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                        <div className="h-24 w-24 rounded-2xl bg-gray-50 flex items-center justify-center mb-6">
                            <span className="text-4xl font-bold text-gray-200">
                                {student["Nome Completo"]?.charAt(0)}
                            </span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 leading-tight">
                            {student["Nome Completo"]}
                        </h2>
                        <div className="mt-4 flex flex-col gap-2">
                            <span className={`inline-flex items-center w-fit px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${isDistrato ? 'bg-red-50 text-red-600 border border-red-100' :
                                student['Situação Cadastral'] === 'TRANCADO' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                    'bg-green-50 text-green-600 border border-green-100'
                                }`}>
                                {student['Situação Cadastral']}
                            </span>
                        </div>
                    </div>

                    <div className="bg-primary/5 rounded-3xl p-6 border border-primary/10">
                        <div className="flex items-center gap-3 text-primary mb-2">
                            <Clock size={18} />
                            <h4 className="text-xs font-bold uppercase tracking-widest">Data Sugerida (PDF)</h4>
                        </div>
                        <p className="text-2xl font-bold text-primary">{dataFimPdf}</p>
                        <p className="text-[10px] text-primary/60 mt-1 uppercase font-medium">Calculado via Regras de Turma</p>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-8 py-6 border-b border-gray-50">
                            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Informações Cadastrais</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2">
                            <InfoItem icon={<GraduationCap size={18} />} label="Curso" value={student["Curso"] || student["CURSO"] || student.sourceSheet} />
                            <InfoItem icon={<Calendar size={18} />} label="Nascimento" value={student["Data de Nascimento"] || student["DATA DE NASCIMENTO"]} />
                            <InfoItem icon={<Mail size={18} />} label="E-mail" value={student["E-mail"] || student["EMAIL"] || "-"} />
                            <InfoItem icon={<Phone size={18} />} label="Telefone" value={student["Telefone"] || "-"} />
                            <InfoItem icon={<FileText size={18} />} label="CPF" value={student["CPF"]} />
                            <InfoItem icon={<Calendar size={18} />} label="Data de Matrícula" value={student["Data da matrícula"] || student["Data da Matrícula"] || student["DATA DE MATRÍCULA"] || "-"} />
                        </div>
                    </div>

                    {isDistrato && (
                        <div className="mt-6 bg-red-50 border border-red-100 rounded-2xl p-6 flex gap-4 animate-in shake-in duration-500">
                            <AlertCircle className="text-red-500 h-6 w-6 flex-shrink-0" />
                            <div>
                                <h4 className="text-sm font-bold text-red-700 uppercase tracking-widest">Restrição de Emissão</h4>
                                <p className="text-sm text-red-600 mt-1 font-medium">Este aluno está em status de Distrato. A emissão de documentos oficiais está suspensa permanentemente.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Warning Modal */}
            {showWarning && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowWarning(false)} />
                    <div className="relative bg-white rounded-[2rem] shadow-2xl max-w-md w-full p-10 animate-in zoom-in-95 duration-200 text-center border border-gray-100">
                        <div className="bg-amber-50 h-20 w-20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-amber-500">
                            <AlertCircle size={40} />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">Aluno com Restrição</h3>
                        <p className="text-gray-500 mb-8 font-medium">
                            A situação cadastral desta conta é <span className="text-amber-600 font-bold">"{student['Situação Cadastral']}"</span>.
                            Deseja confirmar a geração da declaração?
                        </p>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => handleGenerateDeclaration(true)}
                                className="w-full py-4 text-sm font-bold text-white bg-black rounded-full hover:bg-gray-900 transition-all active:scale-95 shadow-lg shadow-black/10"
                            >
                                Confirmar Emissão
                            </button>
                            <button
                                onClick={() => setShowWarning(false)}
                                className="w-full py-4 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
    return (
        <div className="px-8 py-8 border-r border-b border-gray-50 last:border-r-0 group hover:bg-gray-50/50 transition-colors">
            <div className="flex items-center gap-3 text-gray-300 mb-2 group-hover:text-primary transition-colors">
                {icon}
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{label}</span>
            </div>
            <p className="text-base font-bold text-gray-900 truncate" title={value}>{value}</p>
        </div>
    );
}
