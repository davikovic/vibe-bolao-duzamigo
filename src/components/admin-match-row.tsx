"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { updateMatchResult } from "@/app/actions/admin";
import { Trophy, CheckCircle2, Loader2 } from "lucide-react";

interface AdminMatchRowProps {
  id: number;
  teamA: string;
  teamB: string;
  teamAFlag: string;
  teamBFlag: string;
  initialScoreA?: number | null;
  initialScoreB?: number | null;
}

export function AdminMatchRow({ id, teamA, teamB, teamAFlag, teamBFlag, initialScoreA, initialScoreB }: AdminMatchRowProps) {
  const [scoreA, setScoreA] = useState<string>(initialScoreA !== null && initialScoreA !== undefined ? String(initialScoreA) : "");
  const [scoreB, setScoreB] = useState<string>(initialScoreB !== null && initialScoreB !== undefined ? String(initialScoreB) : "");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpdate = async () => {
    if (scoreA === "" || scoreB === "") {
      toast.error("Insira o placar oficial antes de processar!");
      return;
    }

    const confirm = window.confirm(`Deseja realmente finalizar o jogo ${teamA} ${scoreA} x ${scoreB} ${teamB} e distribuir os pontos? Esta ação irá recalcular o ranking.`);
    
    if (!confirm) return;

    setIsProcessing(true);
    const result = await updateMatchResult(id, parseInt(scoreA, 10), parseInt(scoreB, 10));
    setIsProcessing(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(result.message);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-6 bg-[#121212] border border-white/5 rounded-3xl shadow-xl hover:border-white/10 transition-all">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-6">
        {/* Team A */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-8 rounded-lg overflow-hidden border border-white/10 bg-black/40 flex-shrink-0">
            <img src={teamAFlag} alt={teamA} className="w-full h-full object-cover" />
          </div>
          <span className="font-black text-sm text-white uppercase tracking-tighter truncate">{teamA}</span>
        </div>

        {/* Score Inputs */}
        <div className="flex items-center gap-3 bg-black/40 p-1.5 rounded-2xl border border-white/5">
          <Input 
            type="number" 
            min="0"
            value={scoreA}
            onChange={(e) => {
              if (parseInt(e.target.value) < 0) return;
              setScoreA(e.target.value);
            }}
            className="w-12 h-10 text-center font-black bg-white/5 border-none focus-visible:ring-yellow-500 rounded-xl"
            placeholder="-"
          />
          <span className="text-yellow-500/50 font-black text-xs">VS</span>
          <Input 
            type="number" 
            min="0"
            value={scoreB}
            onChange={(e) => {
              if (parseInt(e.target.value) < 0) return;
              setScoreB(e.target.value);
            }}
            className="w-12 h-10 text-center font-black bg-white/5 border-none focus-visible:ring-yellow-500 rounded-xl"
            placeholder="-"
          />
        </div>

        {/* Team B */}
        <div className="flex items-center gap-4 justify-end">
          <span className="font-black text-sm text-white uppercase tracking-tighter truncate text-right">{teamB}</span>
          <div className="w-12 h-8 rounded-lg overflow-hidden border border-white/10 bg-black/40 flex-shrink-0">
            <img src={teamBFlag} alt={teamB} className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
      
      <Button 
        onClick={handleUpdate} 
        disabled={isProcessing}
        variant={initialScoreA !== null ? "outline" : "default"}
        className={`w-full ${initialScoreA === null ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}`}
      >
        {isProcessing ? (
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
        ) : (
          <CheckCircle2 className="w-4 h-4 mr-2" />
        )}
        {initialScoreA !== null ? "Atualizar Resultado e Re-arquivar" : "Finalizar e Distribuir Pontos"}
      </Button>
    </div>
  );
}
