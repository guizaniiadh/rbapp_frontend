import { NextResponse } from 'next/server';
import { Bank, UpdateBankDto } from '@/types/bank';

// Mock database - this would be replaced with actual database calls
let banks: Bank[] = [];

// GET /api/banks/[id]
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const bank = banks.find(b => b.id === id);

    if (!bank) {
      return NextResponse.json(
        { message: 'Bank not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(bank);
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/banks/[id]
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const updateData: UpdateBankDto = await request.json();
    
    const bankIndex = banks.findIndex(b => b.id === id);
    
    if (bankIndex === -1) {
      return NextResponse.json(
        { message: 'Bank not found' },
        { status: 404 }
      );
    }

    // Check if code is being updated and if it's already taken
    if (updateData.code && banks.some(b => b.code === updateData.code && b.id !== id)) {
      return NextResponse.json(
        { message: 'Bank with this code already exists' },
        { status: 400 }
      );
    }

    const updatedBank: Bank = {
      ...banks[bankIndex],
      ...updateData,
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

// DELETE /api/banks/[id]
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const bankIndex = banks.findIndex(b => b.id === id);
    
    if (bankIndex === -1) {
      return NextResponse.json(
        { message: 'Bank not found' },
        { status: 404 }
      );
    }

    banks = banks.filter(b => b.id !== id);
    
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
