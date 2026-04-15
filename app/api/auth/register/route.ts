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

  const newUser = { id: Date.now().toString(), name, email, password };
  users.push(newUser);

  const res = NextResponse.json({ id: newUser.id, name, email });
  res.cookies.set("swiftblock_session", newUser.id, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 дней
  });
  return res;
}
