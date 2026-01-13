import { NextResponse } from 'next/server';
import { getStudentData } from '@/lib/sheets';
import { gerarDeclaracaoPDF } from '@/lib/pdf';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getSaoPauloDate } from '@/lib/utils';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ cpf: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { cpf } = await params;
        if (!cpf) {
            return NextResponse.json({ error: 'CPF required' }, { status: 400 });
        }

        const students = await getStudentData();
        const student = students.find((s) => {
            const sCpf = s['CPF']?.replace(/\D/g, '') || '';
            const pCpf = cpf.replace(/\D/g, '');
            return sCpf === pCpf;
        });

        if (!student) {
            return NextResponse.json({ error: 'Student not found' }, { status: 404 });
        }

        const studentName = student['Nome Completo'] || student['NOME COMPLETO'] || student['nome completo'] || 'Aluno';
        const studentCpf = student['CPF'] || student['cpf'] || student['Cpf'] || cpf;
        const studentStatus = student['Situação Cadastral'] || student['SITUAÇÃO CADASTRAL'] || student['Situacao Cadastral'] || 'ATIVO';
        const studentMatricula = student['DATA DE MATRÍCULA'] || student['Data de Matrícula'] || student['Data da matrícula'] || student['Data da Matrícula'] || '';
        const studentTurma = student['Turma'] || student['TURMA'] || student['turma'] || '';

        if (studentStatus.toUpperCase() === 'DISTRATO') {
            return NextResponse.json({ error: 'Declaração indisponível para alunos com Distrato.' }, { status: 403 });
        }

        const pdfBytes = await gerarDeclaracaoPDF({
            nome: studentName,
            cpf: studentCpf,
            dataMatricula: studentMatricula,
            turma: studentTurma,
            status: studentStatus,
        });

        await prisma.logDeclaracao.create({
            data: {
                emailUsuario: session.user.email,
                nomeAluno: studentName,
                cpfAluno: studentCpf,
                statusPagamento: studentStatus,
                warningExibido: studentStatus.toUpperCase() !== 'ATIVO',
                dataGeracao: getSaoPauloDate(),
            },
        });

        const sanitizedName = studentName.replace(/[^\w\s-]/gi, '').trim().replace(/\s+/g, '_');
        const filename = `Declaracao_de_Matricula_${sanitizedName}.pdf`;

        return new NextResponse(pdfBytes as any, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${filename}"`,
            },
        });

    } catch (error) {
        console.error('--- PDF GENERATION ERROR ---');
        console.error('Message:', (error as Error).message);
        console.error('Stack:', (error as Error).stack);
        console.error('-----------------------------');
        return NextResponse.json({
            error: 'Internal Server Error',
            details: (error as Error).message
        }, { status: 500 });
    }
}
