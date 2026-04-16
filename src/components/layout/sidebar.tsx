"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Trophy, Users, User, LayoutDashboard, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

const navItems = [
  { href: "/", label: "Início", icon: Home },
  { href: "/", label: "Bolão", icon: LayoutDashboard }, // Linkando para a home por enquanto
  { href: "/ranking", label: "Ranking", icon: Trophy },
  { href: "/profile", label: "Meu Perfil", icon: User },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 bg-[#0d0d0d] border-r border-white/5 h-screen sticky top-0 z-40">
      <div className="p-8">
        <div className="flex items-center gap-3 group cursor-default">
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(234,179,8,0.3)] transition-transform group-hover:scale-105">
            <Trophy className="text-black w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-xl tracking-tighter text-white">BOLÃO</span>
            <span className="text-[10px] font-bold text-yellow-500 tracking-[0.2em] -mt-1 uppercase">Duzamigo</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative",
                isActive 
                  ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20" 
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive ? "text-yellow-500" : "group-hover:text-yellow-400")} />
              <span className="font-semibold text-sm">{item.label}</span>
              {isActive && (
                <div className="absolute right-2 w-1 h-5 bg-yellow-500 rounded-full shadow-[0_0_8px_rgba(234,179,8,0.5)]" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto">
        <div className="bg-gradient-to-br from-yellow-500/10 to-transparent p-4 rounded-2xl border border-yellow-500/10 mb-6">
          <p className="text-[10px] uppercase font-bold text-yellow-500/60 tracking-widest mb-1">Próximo Jogo</p>
          <p className="text-xs font-bold text-white mb-2">Brasil vs Argentina</p>
          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
             <div className="bg-yellow-500 h-full w-[45%]" />
          </div>
        </div>

        <button 
           onClick={() => signOut({ callbackUrl: "/login" })}
           className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-400/5 transition-all text-sm font-semibold"
        >
          <LogOut className="w-5 h-5" />
          Sair do App
        </button>
      </div>
    </aside>
  );
}
