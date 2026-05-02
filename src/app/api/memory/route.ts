import { NextRequest, NextResponse } from 'next/server';
import { getAllMemories, deleteMemory } from '@/lib/memory';

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

    const memories = await getAllMemories(userId);
    return NextResponse.json({ success: true, memories });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { memoryId, userId } = await request.json();
    if (!memoryId || !userId) return NextResponse.json({ error: 'Missing memoryId or userId' }, { status: 400 });

    await deleteMemory(memoryId, userId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
