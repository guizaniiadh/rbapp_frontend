import { NextResponse } from 'next/server';

// Mock database - this would be replaced with actual database calls
let banks: any[] = [];

// PATCH /api/banks/[id]/status
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { isActive } = await request.json();
    
    const bankIndex = banks.findIndex(b => b.id === id);
    
    if (bankIndex === -1) {
      return NextResponse.json(
        { message: 'Bank not found' },
        { status: 404 }
      );
    }

    const updatedBank = {
      ...banks[bankIndex],
      isActive,
      updatedAt: new Date(),
    };

    banks[bankIndex] = updatedBank;
    
    return NextResponse.json(updatedBank);
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
