"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { saveGuess } from "@/app/actions/guess";
import { Check, Loader2, Lock } from "lucide-react";

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
      toast.error("Preencha o placar para ambos os times!");
      return;
    }

    setIsSaving(true);
    const result = await saveGuess(Number(id), parseInt(guessA, 10), parseInt(guessB, 10));
    setIsSaving(false);
    
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(result.message || "Palpite salvo com sucesso! ⚽");
    }
  };

  const hasChanged = guessA !== String(initialGuessA ?? "") || guessB !== String(initialGuessB ?? "");
  const actuallyLocked = isLocked || isFinished;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={!actuallyLocked ? { scale: 1.02 } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`bg-white dark:bg-gray-900 border rounded-2xl p-4 shadow-sm relative overflow-hidden transition-all ${
        isFinished 
          ? 'opacity-70 border-gray-200 dark:border-gray-800 grayscale-[0.3]' 
          : actuallyLocked 
            ? 'opacity-85 border-gray-100 dark:border-gray-800' 
            : 'border-gray-100 dark:border-gray-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)]'
      }`}
    >
      <div className="flex justify-center mb-4">
        {isFinished ? (
          <span className="text-[10px] font-bold tracking-widest text-white uppercase bg-gray-500 dark:bg-gray-700 px-3 py-1 rounded-full flex items-center gap-1.5">
            <Lock size={10} /> Jogo Encerrado
          </span>
        ) : (
          <span className="text-xs font-semibold tracking-wider text-gray-500 uppercase bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
            {group} • {date}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 mb-2">
        {/* Team A */}
        <div className="flex flex-col items-center flex-1">
          <div className="w-12 h-12 flex items-center justify-center text-4xl mb-2 drop-shadow-md">
            {teamA.flag}
          </div>
          <span className="font-bold text-sm text-gray-800 dark:text-gray-200 text-center uppercase tracking-wide line-clamp-1">
            {teamA.name}
          </span>
        </div>

        {/* Score Area */}
        <div className="flex flex-col items-center gap-2">
          {isFinished && (
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-1">Resultado Real</div>
          )}
          <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-950 p-2 rounded-xl border border-gray-100 dark:border-gray-800">
            {isFinished ? (
              <div className="flex items-center gap-4 px-2">
                <span className="text-3xl font-black text-gray-900 dark:text-white">{finalScoreA}</span>
                <span className="text-gray-400 font-bold text-sm">X</span>
                <span className="text-3xl font-black text-gray-900 dark:text-white">{finalScoreB}</span>
              </div>
            ) : (
              <>
                <Input 
                  type="number" 
                  value={guessA}
                  onChange={(e) => setGuessA(e.target.value)}
                  disabled={actuallyLocked || isSaving}
                  className="w-14 h-14 text-center text-2xl font-bold bg-white dark:bg-gray-900 border-none shadow-sm focus-visible:ring-blue-500 disabled:opacity-100 transition-all"
                  placeholder="-"
                />
                <span className="text-gray-400 font-medium select-none">X</span>
                <Input 
                  type="number" 
                  value={guessB}
                  onChange={(e) => setGuessB(e.target.value)}
                  disabled={actuallyLocked || isSaving}
                  className="w-14 h-14 text-center text-2xl font-bold bg-white dark:bg-gray-900 border-none shadow-sm focus-visible:ring-blue-500 disabled:opacity-100 transition-all"
                  placeholder="-"
                />
              </>
            )}
          </div>
          {isFinished && (
            <div className="mt-2 flex flex-col items-center">
               <div className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">Seu Palpite: {guessA || 0} x {guessB || 0}</div>
            </div>
          )}
        </div>

        {/* Team B */}
        <div className="flex flex-col items-center flex-1">
          <div className="w-12 h-12 flex items-center justify-center text-4xl mb-2 drop-shadow-md">
            {teamB.flag}
          </div>
          <span className="font-bold text-sm text-gray-800 dark:text-gray-200 text-center uppercase tracking-wide line-clamp-1">
            {teamB.name}
          </span>
        </div>
      </div>

      <AnimatePresence>
        {!actuallyLocked && hasChanged && (
          <motion.div
            initial={{ height: 0, opacity: 0, marginTop: 0 }}
            animate={{ height: "auto", opacity: 1, marginTop: 16 }}
            exit={{ height: 0, opacity: 0, marginTop: 0 }}
            className="overflow-hidden"
          >
            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors shadow-lg shadow-emerald-900/10"
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Check className="w-4 h-4 mr-2" /> Salvar Palpite</>}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
