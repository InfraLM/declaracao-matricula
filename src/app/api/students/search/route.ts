import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    try {
        const response = await fetch(`${backendUrl}/api/students/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Frontend Proxy Error:', error);
        return NextResponse.json({ error: 'Failed to fetch from backend' }, { status: 500 });
    }
}
