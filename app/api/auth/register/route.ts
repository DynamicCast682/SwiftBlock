import { NextRequest, NextResponse } from "next/server";
import { users } from "@/lib/store";

export async function POST(req: NextRequest) {
  const { name, email, password } = await req.json();

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Заполните все поля" }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "Пароль должен содержать минимум 6 символов" },
      { status: 400 }
    );
  }

  if (users.find((u) => u.email === email)) {
    return NextResponse.json(
      { error: "Пользователь с таким email уже существует" },
      { status: 409 }
    );
  }

  const defaultBalances = [
    { symbol: "SWFT", name: "SwiftBlock Token", amount: 500.0 },
    { symbol: "BTC", name: "Bitcoin", amount: 0.05 },
    { symbol: "ETH", name: "Ethereum", amount: 1.2 },
    { symbol: "USDT", name: "Tether", amount: 1500.0 },
    { symbol: "SOL", name: "Solana", amount: 25.5 },
  ];

  const newUser = { id: Date.now().toString(), name, email, password, balances: defaultBalances };
  users.push(newUser);

  const res = NextResponse.json({ id: newUser.id, name, email, balances: newUser.balances });
  res.cookies.set("swiftblock_session", newUser.id, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 дней
  });
  return res;
}
