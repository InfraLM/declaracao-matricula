import { NextResponse } from 'next/server';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ cpf: string }> }
) {
    const { cpf } = await params;
    const body = await request.json();
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    try {
        const response = await fetch(`${backendUrl}/api/students/${cpf}/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        // Proxy the PDF stream or buffer
        const buffer = await response.arrayBuffer();
        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="declaracao-${cpf}.pdf"`,
            },
        });
    } catch (error) {
        console.error('Frontend PDF Proxy Error:', error);
        return NextResponse.json({ error: 'Failed to generate PDF in backend' }, { status: 500 });
    }
}
