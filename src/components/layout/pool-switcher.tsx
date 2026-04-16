"use client";

import { useEffect, useState, useRef } from "react";
import { ChevronDown, Check, LayoutPanelLeft } from "lucide-react";
import { usePool } from "@/components/providers/pool-provider";
import { getApprovedPools } from "@/app/actions/pool_actions";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Pool {
  id: number;
  name: string;
}

export function PoolSwitcher() {
  const { activePoolId, setActivePool } = usePool();
  const [pools, setPools] = useState<Pool[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getApprovedPools().then(setPools);

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activePool = pools.find(p => p.id === activePoolId) || pools[0];

  return (
    <div className="relative px-6 mb-2" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-yellow-500/20 transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
            <LayoutPanelLeft size={16} className="text-yellow-500" />
          </div>
          <div className="flex flex-col items-start min-w-0">
            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1">Bolão Selecionado</span>
            <span className="text-xs font-black text-white truncate max-w-[120px]">
              {activePool?.name || "Carregando..."}
            </span>
          </div>
        </div>
        <ChevronDown size={14} className={cn("text-gray-500 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-6 right-6 mt-2 bg-black border border-white/10 rounded-2xl shadow-2xl z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="p-2 space-y-1 max-h-[250px] overflow-y-auto custom-scrollbar">
            {pools.map((pool) => (
              <button
                key={pool.id}
                onClick={() => {
                  setActivePool(pool.id);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center justify-between gap-3 p-3 rounded-xl transition-all text-left",
                  pool.id === activePoolId 
                    ? "bg-yellow-500/20 text-yellow-500" 
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <span className="text-xs font-bold truncate">{pool.name}</span>
                {pool.id === activePoolId && <Check size={14} />}
              </button>
            ))}
          </div>
          <div className="border-t border-white/5 p-2">
             <Link 
               href="/pools/explore"
               onClick={() => setIsOpen(false)}
               className="flex items-center justify-center gap-2 p-2 rounded-xl text-[9px] font-black uppercase tracking-widest text-yellow-500/60 hover:text-yellow-500 transition-colors"
             >
                Explorar Novos Bolões
             </Link>
          </div>
        </div>
      )}
    </div>
  );
}
