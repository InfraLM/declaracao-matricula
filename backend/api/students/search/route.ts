import { NextResponse } from 'next/server';
import { getStudentData } from '@/lib/sheets';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
    try {
        // 1. Check Authentication (Optional but recommended for security)
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Parse Query
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q')?.toLowerCase() || '';

        if (!query) {
            return NextResponse.json({ data: [] });
        }

        // 3. Fetch Data (Consider caching strategy in future)
        const students = await getStudentData();

        // 4. Filter
        const filtered = students.filter((student) => {
            const nome = student['Nome Completo']?.toLowerCase() || '';
            const cpf = student['CPF'] || '';

            // Simple includes check
            return nome.includes(query) || cpf.includes(query);
        });

        // 5. Limit results
        const limited = filtered.slice(0, 20);

        return NextResponse.json({ data: limited });

    } catch (error) {
        console.error('Search API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
