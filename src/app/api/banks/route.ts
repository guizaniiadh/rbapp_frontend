import { NextResponse } from 'next/server';
import { Bank, CreateBankDto } from '@/types/bank';

// Mock database - replace this with your actual database calls
let banks: Bank[] = [];
let idCounter = 1;

// GET /api/banks
export async function GET() {
  try {
    return NextResponse.json(banks);
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/banks
export async function POST(request: Request) {
  try {
    const bankData: CreateBankDto = await request.json();
    
    // Validate input
    if (!bankData.name || !bankData.code || !bankData.country) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if bank with same code already exists
    if (banks.some(bank => bank.code === bankData.code)) {
      return NextResponse.json(
        { message: 'Bank with this code already exists' },
        { status: 400 }
      );
    }

    const newBank: Bank = {
      id: (idCounter++).toString(),
      ...bankData,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    banks.push(newBank);
    
    return NextResponse.json(newBank, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
