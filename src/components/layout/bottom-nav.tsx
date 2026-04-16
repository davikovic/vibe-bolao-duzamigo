"use client";

import { Home, Trophy, Search, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navItems = [
  { id: "home", href: "/", label: "Início", icon: Home },
  { id: "explore", href: "/pools/explore", label: "Explorar", icon: Search },
  { id: "ranking", href: "/ranking", label: "Ranking", icon: Trophy },
  { id: "profile", href: "/profile", label: "Perfil", icon: User },
];
export function BottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const avatarUrl = session?.user?.image || `https://api.dicebear.com/7.x/bottts/svg?seed=${session?.user?.email || 'default'}`;

  return (
    <nav className="fixed bottom-0 w-full bg-[#0d0d0d]/80 backdrop-blur-xl border-t border-white/5 pb-safe z-50 transition-all duration-300">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link 
              key={item.id}
              href={item.href} 
              className={cn(
                "flex flex-col items-center justify-center w-full h-full transition-all duration-200",
                isActive ? "text-yellow-500" : "text-gray-500"
              )}
            >
              <div className={cn(
                "p-1.5 rounded-xl transition-all relative",
                isActive ? "bg-yellow-500/10" : ""
              )}>
                {item.id === "profile" && session?.user ? (
                   <Avatar className={cn(
                     "w-5 h-5 border transition-all",
                     isActive ? "border-yellow-500" : "border-white/10"
                   )}>
                     <AvatarImage src={avatarUrl} />
                     <AvatarFallback className="text-[8px] font-black bg-black text-white">
                        {session.user.name?.substring(0, 2).toUpperCase()}
                     </AvatarFallback>
                   </Avatar>
                ) : (
                  <Icon className="w-5 h-5 mb-0.5" />
                )}
              </div>
              <span className="text-[9px] font-black uppercase tracking-tighter mt-0.5">{item.label}</span>
              {isActive && (
                <div className="absolute bottom-1 w-1 h-1 bg-yellow-500 rounded-full shadow-[0_0_8px_rgba(234,179,8,0.5)]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
