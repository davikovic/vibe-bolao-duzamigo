"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { saveGuess } from "@/app/actions/guess";
import { Check, Loader2 } from "lucide-react";

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
}

export function GameCard({ id, date, group, teamA, teamB, initialGuessA, initialGuessB, isLocked }: GameCardProps) {
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

  // Verifica se o valor atual difere do valor inicial para mostrar o botão Save
  const hasChanged = guessA !== String(initialGuessA ?? "") || guessB !== String(initialGuessB ?? "");

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={!isLocked ? { scale: 1.02 } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(255,255,255,0.02)] relative overflow-hidden ${isLocked ? 'opacity-80' : ''}`}
    >
      <div className="flex justify-center mb-4">
        <span className="text-xs font-semibold tracking-wider text-gray-500 uppercase bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
          {group} • {date}
        </span>
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

        {/* Score Inputs */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-950 p-2 rounded-xl border border-gray-100 dark:border-gray-800">
            <Input 
              type="number" 
              min="0"
              max="99"
              placeholder="-"
              value={guessA}
              onChange={(e) => setGuessA(e.target.value)}
              disabled={isLocked || isSaving}
              className="w-14 h-14 text-center text-2xl font-bold bg-white dark:bg-gray-900 border-none shadow-sm focus-visible:ring-blue-500 disabled:opacity-100 transition-all"
            />
            <span className="text-gray-400 font-medium select-none">X</span>
            <Input 
              type="number" 
              min="0"
              max="99"
              placeholder="-"
              value={guessB}
              onChange={(e) => setGuessB(e.target.value)}
              disabled={isLocked || isSaving}
              className="w-14 h-14 text-center text-2xl font-bold bg-white dark:bg-gray-900 border-none shadow-sm focus-visible:ring-blue-500 disabled:opacity-100 transition-all"
            />
          </div>
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

      {/* Botão de Salvar Animado */}
      <AnimatePresence>
        {!isLocked && hasChanged && (
          <motion.div
            initial={{ height: 0, opacity: 0, marginTop: 0 }}
            animate={{ height: "auto", opacity: 1, marginTop: 16 }}
            exit={{ height: 0, opacity: 0, marginTop: 0 }}
            className="overflow-hidden"
          >
            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors"
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Check className="w-4 h-4 mr-2" /> Salvar Palpite</>}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
      
      {isLocked && (
        <div className="mt-4 text-center text-xs font-semibold text-gray-500 uppercase">
          🔒 Partida Encerrada
        </div>
      )}
    </motion.div>
  );
}
