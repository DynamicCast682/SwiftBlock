import { NextRequest, NextResponse } from "next/server";
import { users } from "@/lib/store";

export async function POST(req: NextRequest) {
  const userId = req.cookies.get("swiftblock_session")?.value;
  if (!userId) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const userIndex = users.findIndex((u) => u.id === userId);
  if (userIndex === -1) {
    return NextResponse.json({ error: "Пользователь не найден" }, { status: 401 });
  }

  const user = users[userIndex];
  
  // Добавляем тестовые балансы
  const defaultBalances = [
    { symbol: "BTC", name: "Bitcoin", amount: 1.5 },
    { symbol: "USDT", name: "Tether", amount: 25000 },
    { symbol: "ETH", name: "Ethereum", amount: 12.8 },
    { symbol: "SWFT", name: "SwiftBlock Token", amount: 5000 }
  ];

  if (!user.balances || user.balances.length === 0) {
    user.balances = defaultBalances;
  } else {
    // Просто увеличиваем текущие
    user.balances = user.balances.map(b => ({
      ...b,
      amount: b.amount + (defaultBalances.find(d => d.symbol === b.symbol)?.amount || 100)
    }));
  }

  return NextResponse.json({ success: true, balances: user.balances });
}
