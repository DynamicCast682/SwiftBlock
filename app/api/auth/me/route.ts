import { NextRequest, NextResponse } from "next/server";
import { users } from "@/lib/store";

export async function GET(req: NextRequest) {
  const userId = req.cookies.get("swiftblock_session")?.value;
  if (!userId) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const user = users.find((u) => u.id === userId);
  if (!user) {
    return NextResponse.json({ error: "Пользователь не найден" }, { status: 401 });
  }

  return NextResponse.json({ id: user.id, name: user.name, email: user.email, balances: user.balances ?? [] });
}
