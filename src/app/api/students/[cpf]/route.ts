import { NextResponse } from 'next/server';
import { getStudentData } from '@/lib/sheets';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ cpf: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const resolvedParams = await params;
        const cpf = resolvedParams.cpf;

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

        return NextResponse.json({ data: student });

    } catch (error) {
        console.error('Student API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
