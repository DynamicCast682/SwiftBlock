"use client";

import { useAuth } from "@/lib/auth-context";
import { Wallet, User, Mail, Shield, ArrowUpRight, ArrowDownLeft, MoreHorizontal } from "lucide-react";

export default function AccountPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Кошелек</h2>
          <p className="text-muted-foreground">
            Управляйте вашими активами и просматривайте баланс.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
            <ArrowDownLeft className="h-4 w-4" />
            Пополнить
          </button>
          <button className="flex items-center gap-2 rounded-md border bg-background px-4 py-2 text-sm font-medium hover:bg-muted transition-colors">
            <ArrowUpRight className="h-4 w-4" />
            Вывести
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                Ваши активы
              </h3>
              <span className="text-xs text-muted-foreground">Обновлено только что</span>
            </div>
            <div className="divide-y">
              {user.balances?.length > 0 ? (
                user.balances.map((asset) => (
                  <div key={asset.symbol} className="px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs">
                        {asset.symbol.slice(0, 3)}
                      </div>
                      <div>
                        <p className="font-medium">{asset.name}</p>
                        <p className="text-xs text-muted-foreground">{asset.symbol}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{asset.amount.toLocaleString(undefined, { maximumFractionDigits: 8 })}</p>
                      <p className="text-xs text-muted-foreground">≈ $--.--</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-10 text-center text-muted-foreground">
                  Нет доступных активов
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Безопасность
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">2FA</span>
                <span className="text-xs font-medium bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Отключено</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Лимит вывода</span>
                <span className="text-xs font-medium text-foreground">$10,000 / день</span>
              </div>
            </div>
            <button className="mt-6 w-full text-xs text-primary hover:underline">
              Настройки безопасности
            </button>
          </div>

          <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b bg-muted/30">
              <h3 className="font-semibold flex items-center gap-2">
                <User className="h-4 w-4" />
                Профиль
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-1">Имя</p>
                <p className="text-sm font-medium">{user.name}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-1">Email</p>
                <p className="text-sm font-medium truncate">{user.email}</p>
              </div>
              <button className="w-full text-xs text-primary hover:underline text-left">
                Редактировать данные
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
