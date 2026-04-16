"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { saveGuess } from "@/app/actions/guess";
import { Check, Loader2, Lock, Shield, Target, Calendar } from "lucide-react";

export interface Team {
  id: string;
  name: string;
  flag: string;
}

export interface GameCardProps {
  id: string;
  date: string;
  group: string;
  teamA: Team;
  teamB: Team;
  initialGuessA?: number | null;
  initialGuessB?: number | null;
  isLocked?: boolean;
  isFinished?: boolean;
  finalScoreA?: number | null;
  finalScoreB?: number | null;
}

export function GameCard({ 
  id, date, group, teamA, teamB, initialGuessA, initialGuessB, isLocked, isFinished, finalScoreA, finalScoreB 
}: GameCardProps) {
  const [guessA, setGuessA] = useState<string>(initialGuessA !== undefined && initialGuessA !== null ? String(initialGuessA) : "");
  const [guessB, setGuessB] = useState<string>(initialGuessB !== undefined && initialGuessB !== null ? String(initialGuessB) : "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (guessA === "" || guessB === "") {
      toast.error("Preencha o placar!");
      return;
    }

    setIsSaving(true);
    const result = await saveGuess(Number(id), parseInt(guessA, 10), parseInt(guessB, 10));
    setIsSaving(false);
    
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(result.message || "Palpite registrado! ⚡");
    }
  };

  const hasChanged = guessA !== String(initialGuessA ?? "") || guessB !== String(initialGuessB ?? "");
  const actuallyLocked = isLocked || isFinished;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={!actuallyLocked ? { y: -5, borderColor: "rgba(234,179,8,0.3)" } : {}}
      className={`group relative bg-[#121212]/60 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6 transition-all duration-300 ${
        actuallyLocked ? 'opacity-80' : 'hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]'
      }`}
    >
      {/* Background Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent rounded-[2rem] -z-10" />

      {/* Header Info */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
             <Shield className="w-4 h-4 text-yellow-500" />
           </div>
           <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{group}</span>
        </div>
        
        <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
           <Calendar className="w-3 h-3 text-yellow-500/50" />
           <span className="text-[10px] font-bold text-gray-400">{date}</span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-6 relative">
        {/* Team A */}
        <div className="flex flex-col items-center flex-1 space-y-3">
          <div className="relative group/flag">
            <div className="absolute -inset-2 bg-yellow-500/20 rounded-full blur-xl opacity-0 group-hover/flag:opacity-100 transition-opacity" />
            <span className="text-5xl drop-shadow-2xl relative z-10">{teamA.flag}</span>
          </div>
          <span className="font-black text-xs text-white uppercase tracking-tighter text-center">
            {teamA.name}
          </span>
        </div>

        {/* Competition Verses */}
        <div className="flex flex-col items-center justify-center min-w-[120px]">
          {isFinished ? (
            <div className="flex flex-col items-center gap-1">
               <span className="text-[8px] font-black uppercase text-yellow-500 tracking-[0.2em] mb-1">Finalizado</span>
               <div className="flex items-center gap-4 bg-black/40 px-4 py-2 rounded-2xl border border-white/5 shrink-0">
                  <span className="text-3xl font-black text-white">{finalScoreA}</span>
                  <span className="text-yellow-500 text-sm font-bold">:</span>
                  <span className="text-3xl font-black text-white">{finalScoreB}</span>
               </div>
               <div className="mt-4 flex flex-col items-center">
                  <span className="text-[8px] font-bold text-gray-500 uppercase">Seu Palpite</span>
                  <span className="text-[10px] font-black text-gray-400">{guessA || 0} x {guessB || 0}</span>
               </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 bg-black/20 p-1.5 rounded-2xl border border-white/5 shadow-inner">
                <Input 
                  type="number" 
                  value={guessA}
                  onChange={(e) => setGuessA(e.target.value)}
                  disabled={actuallyLocked || isSaving}
                  className="w-12 h-12 text-center text-xl font-black bg-white/5 border-none focus-visible:ring-yellow-500 disabled:opacity-100 rounded-xl"
                  placeholder="?"
                />
                <div className="w-1 h-1 bg-yellow-500/50 rounded-full" />
                <Input 
                  type="number" 
                  value={guessB}
                  onChange={(e) => setGuessB(e.target.value)}
                  disabled={actuallyLocked || isSaving}
                  className="w-12 h-12 text-center text-xl font-black bg-white/5 border-none focus-visible:ring-yellow-500 disabled:opacity-100 rounded-xl"
                  placeholder="?"
                />
              </div>
              
              {!actuallyLocked && (
                <div className="flex items-center gap-1 text-[9px] font-bold text-gray-500 uppercase tracking-tighter">
                  <Target className="w-3 h-3 text-yellow-500/50" /> Insira seu placar
                </div>
              )}
            </div>
          )}
        </div>

        {/* Team B */}
        <div className="flex flex-col items-center flex-1 space-y-3">
          <div className="relative group/flag">
            <div className="absolute -inset-2 bg-yellow-500/20 rounded-full blur-xl opacity-0 group-hover/flag:opacity-100 transition-opacity" />
            <span className="text-5xl drop-shadow-2xl relative z-10">{teamB.flag}</span>
          </div>
          <span className="font-black text-xs text-white uppercase tracking-tighter text-center">
            {teamB.name}
          </span>
        </div>
      </div>

      {/* Save Button */}
      <AnimatePresence>
        {!actuallyLocked && hasChanged && (
          <motion.div
            initial={{ height: 0, opacity: 0, marginTop: 0 }}
            animate={{ height: "auto", opacity: 1, marginTop: 24 }}
            exit={{ height: 0, opacity: 0, marginTop: 0 }}
            className="overflow-hidden"
          >
            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              className="w-full h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-black uppercase tracking-widest text-[10px] rounded-xl shadow-[0_10px_20px_rgba(234,179,8,0.2)]"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4 mr-2" /> Confirmar Palpite</>}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
      
      {actuallyLocked && !isFinished && (
        <div className="mt-6 flex items-center justify-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">
           <Lock className="w-3 h-3" /> Apostas Trancadas
        </div>
      )}
    </motion.div>
  );
}
