import { NextRequest, NextResponse } from "next/server";
import { users } from "@/lib/store";

export async function POST(req: NextRequest) {
  const userId = req.cookies.get("swiftblock_session")?.value;
  if (!userId) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const user = users.find((u) => u.id === userId);
  if (!user) {
    return NextResponse.json({ error: "Пользователь не найден" }, { status: 401 });
  }

  try {
    const { fromSymbol, toSymbol, fromAmount, toAmount } = await req.json();

    if (!user.balances) user.balances = [];

    const fromAsset = user.balances.find(b => b.symbol === fromSymbol);
    if (!fromAsset || fromAsset.amount < fromAmount) {
      return NextResponse.json({ error: "Недостаточно средств" }, { status: 400 });
    }

    // Списываем
    fromAsset.amount -= fromAmount;

    // Начисляем
    let toAsset = user.balances.find(b => b.symbol === toSymbol);
    if (!toAsset) {
      // Если такого актива еще нет в кошельке, добавляем его
      user.balances.push({
        symbol: toSymbol,
        name: toSymbol === "BTC" ? "Bitcoin" : toSymbol === "ETH" ? "Ethereum" : toSymbol,
        amount: toAmount
      });
    } else {
      toAsset.amount += toAmount;
    }

    return NextResponse.json({ success: true, balances: user.balances });
  } catch (error) {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
