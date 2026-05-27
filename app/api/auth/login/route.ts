import { NextRequest, NextResponse } from "next/server";
import { users } from "@/lib/store";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) {
    return NextResponse.json(
      { error: "Неверный email или пароль" },
      { status: 401 }
    );
  }

  const res = NextResponse.json({ id: user.id, name: user.name, email: user.email, balances: user.balances ?? [] });
  res.cookies.set("swiftblock_session", user.id, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
