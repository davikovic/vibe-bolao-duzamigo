import { Home, Trophy, Users, User } from "lucide-react";
import Link from "next/link";

export function BottomNav() {
  return (
    <nav className="sticky bottom-0 w-full bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 pb-safe z-50">
      <div className="flex justify-around items-center h-16">
        <Link href="/" className="flex flex-col items-center justify-center w-full h-full text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-500 transition-colors">
          <Home className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-medium">Início</span>
        </Link>
        <Link href="/" className="flex flex-col items-center justify-center w-full h-full text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-500 transition-colors">
          <Users className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-medium">Bolão</span>
        </Link>
        <Link href="/ranking" className="flex flex-col items-center justify-center w-full h-full text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-500 transition-colors">
          <Trophy className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-medium">Ranking</span>
        </Link>
        <Link href="/profile" className="flex flex-col items-center justify-center w-full h-full text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-500 transition-colors">
          <User className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-medium">Perfil</span>
        </Link>
      </div>
    </nav>
  );
}
