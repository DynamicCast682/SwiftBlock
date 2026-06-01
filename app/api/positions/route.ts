import { NextRequest, NextResponse } from "next/server";
import { users } from "@/lib/store";

interface Position {
  id: string;
  type: "LONG" | "SHORT";
  orderType: "MARKET" | "LIMIT";
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
  const userId = request.cookies.get("swiftblock_session")?.value;
  if (!userId) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const user = users.find((u) => u.id === userId);
  if (!user) {
    return NextResponse.json({ error: "Пользователь не найден" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { instrument, size } = body;

    // Определяем валюту обеспечения
    const isFutures = !instrument.includes('/');
    const marginCurrency = isFutures ? 'USDT' : instrument.split('/')[0];

    const balance = user.balances?.find(b => b.symbol === marginCurrency);
    if (!balance || balance.amount < size) {
      return NextResponse.json(
        { success: false, error: `Недостаточно ${marginCurrency} на балансе` },
        { status: 400 }
      );
    }

    // Списываем средства
    balance.amount -= size;

    const newPosition: Position = {
      id: Math.random().toString(36).substr(2, 9),
      type: body.type,
      orderType: body.orderType || "MARKET",
      instrument: body.instrument,
      size: body.size,
      entryPrice: body.entryPrice || 0,
      stopLoss: body.stopLoss || 0,
      takeProfit: body.takeProfit || 0,
      currentPrice: body.currentPrice || body.entryPrice || 0,
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
  const userId = request.cookies.get("swiftblock_session")?.value;
  if (!userId) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

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

    // Возвращаем средства на баланс при закрытии (упрощенно)
    const isFutures = !closedPosition.instrument.includes('/');
    const marginCurrency = isFutures ? 'USDT' : closedPosition.instrument.split('/')[0];
    
    const user = users.find(u => u.id === userId);
    if (user && user.balances) {
      const balance = user.balances.find(b => b.symbol === marginCurrency);
      if (balance) {
        balance.amount += closedPosition.size;
      }
    }

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
