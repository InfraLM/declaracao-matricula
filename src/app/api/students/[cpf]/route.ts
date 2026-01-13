import { NextResponse } from 'next/server';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ cpf: string }> }
) {
    const { cpf } = await params;
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    try {
        const response = await fetch(`${backendUrl}/api/students/${cpf}`);
        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Frontend Student Proxy Error:', error);
        return NextResponse.json({ error: 'Failed to fetch from backend' }, { status: 500 });
    }
}
