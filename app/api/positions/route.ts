import { NextRequest, NextResponse } from "next/server";

interface Position {
  id: string;
  type: "LONG" | "SHORT";
  instrument: string;
  size: number;
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  currentPrice: number;
  profitLoss: number;
  profitLossPercent: number;
  openTime: string;
}

// In-memory storage (in production, use a database)
let positions: Position[] = [];

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: positions,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch positions" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const newPosition: Position = {
      id: Math.random().toString(36).substr(2, 9),
      type: body.type,
      instrument: body.instrument,
      size: body.size,
      entryPrice: body.entryPrice,
      stopLoss: body.stopLoss,
      takeProfit: body.takeProfit,
      currentPrice: body.currentPrice,
      profitLoss: 0,
      profitLossPercent: 0,
      openTime: new Date().toISOString(),
    };

    positions.push(newPosition);

    return NextResponse.json(
      {
        success: true,
        message: "Position opened successfully",
        data: newPosition,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to create position" },
      { status: 400 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const positionId = searchParams.get("id");

    if (!positionId) {
      return NextResponse.json(
        { success: false, error: "Position ID is required" },
        { status: 400 }
      );
    }

    const positionIndex = positions.findIndex((p) => p.id === positionId);

    if (positionIndex === -1) {
      return NextResponse.json(
        { success: false, error: "Position not found" },
        { status: 404 }
      );
    }

    const closedPosition = positions.splice(positionIndex, 1)[0];

    return NextResponse.json({
      success: true,
      message: "Position closed successfully",
      data: closedPosition,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to close position" },
      { status: 500 }
    );
  }
}
