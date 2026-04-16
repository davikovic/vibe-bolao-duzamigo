"use client";

import { SignOutButton } from "./sign-out-button";
import { ShieldAlert } from "lucide-react";

interface PendingActionsProps {
  isActive: boolean;
}

export function PendingActions({ isActive }: PendingActionsProps) {
  return (
    <div className="w-full space-y-4">
      {isActive ? (
        <div className="bg-green-500/10 p-4 rounded-2xl border border-green-500/20 flex flex-col gap-3 text-center">
          <p className="text-xs font-bold text-green-500 uppercase">Seu acesso foi aprovado!</p>
          <a
            href="/"
            className="bg-green-600 hover:bg-green-500 text-white font-black uppercase tracking-widest text-[10px] py-3 rounded-xl transition-all shadow-lg shadow-green-900/20"
          >
            Entrar no Sistema
          </a>
        </div>
      ) : (
        <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center gap-4 text-left">
          <ShieldAlert className="text-yellow-500/50 shrink-0" size={20} />
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-relaxed">
            Você receberá acesso assim que um administrador confirmar seu vínculo com o grupo.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {!isActive && (
          <button
            onClick={() => window.location.reload()}
            className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors py-2"
          >
            Recarregar Página
          </button>
        )}
        <SignOutButton />
      </div>
    </div>
  );
}
