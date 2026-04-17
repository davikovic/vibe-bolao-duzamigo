"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Globe, Loader2, Zap, X, CheckCircle, Database } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function AdminFifaSync() {
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [roundsMap, setRoundsMap] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>("");
  const router = useRouter();

  const handleFetchPreview = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/matches/sync");
      const data = await res.json();
      if (data.rounds) {
        setRoundsMap(data.rounds);
        const firstKey = Object.keys(data.rounds)[0];
        setActiveTab(firstKey);
        setIsOpen(true);
      } else {
        toast.error("Erro ao ler dados da Copa");
      }
    } catch (err) {
      toast.error("Erro de conexão");
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!roundsMap || !activeTab) return;
    setLoading(true);
    const matchesToImport = roundsMap[activeTab];
    
    try {
      const res = await fetch("/api/matches/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matches: matchesToImport }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`${data.inserted} novos jogos importados com sucesso!`);
        setIsOpen(false);
        router.refresh();
      } else {
        toast.error("Erro ao importar");
      }
    } catch (err) {
      toast.error("Erro de conexão");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button 
        onClick={handleFetchPreview}
        disabled={loading}
        className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-black uppercase tracking-widest text-[10px] h-12 px-6 rounded-2xl shadow-[0_10px_20px_rgba(234,179,8,0.2)] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading && !isOpen ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Buscando JSON...
          </>
        ) : (
          <>
            <Zap className="w-4 h-4 mr-2" fill="black" />
            Sincronizar (Mock)
          </>
        )}
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0a0a0a] border border-yellow-500/20 w-full max-w-4xl rounded-[2rem] overflow-hidden flex flex-col max-h-[90vh] shadow-2xl shadow-yellow-500/10">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-gradient-to-r from-yellow-500/10 to-transparent">
              <div className="flex items-center gap-3">
                <Globe className="text-yellow-500" size={24} />
                <h2 className="text-xl font-black text-white uppercase tracking-tighter">Sincronização de Jogos</h2>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 px-6 py-4 border-b border-white/5 overflow-x-auto no-scrollbar">
              {roundsMap && Object.keys(roundsMap).map((roundKey) => (
                <button
                  key={roundKey}
                  onClick={() => setActiveTab(roundKey)}
                  className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                    activeTab === roundKey 
                      ? "bg-yellow-500 text-black" 
                      : "bg-[#121212] text-gray-500 hover:text-gray-300 border border-white/5"
                  }`}
                >
                  {roundKey}
                </button>
              ))}
            </div>

            {/* Table Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {roundsMap && activeTab && roundsMap[activeTab].map((game: any, idx: number) => (
                <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between bg-[#121212] border border-white/5 p-4 rounded-xl gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{game.group_name} • {new Date(game.date).toLocaleDateString()}</span>
                    <div className="flex flex-col md:flex-row md:items-center gap-3 text-sm font-bold text-white mt-2">
                      <span className="flex items-center gap-2 w-32 border border-white/10 px-3 py-1.5 rounded-lg bg-black/50 justify-between">
                         <span className="truncate">{game.team_a}</span>
                         <span>{game.team_a_flag}</span>
                      </span>
                      <span className="text-gray-500 text-[10px] px-2">VS</span>
                      <span className="flex items-center gap-2 w-32 border border-white/10 px-3 py-1.5 rounded-lg bg-black/50 justify-between">
                         <span className="truncate">{game.team_b}</span>
                         <span>{game.team_b_flag}</span>
                      </span>
                    </div>
                    {game.location && <span className="text-xs text-gray-400 mt-2 flex items-center gap-1">📍 {game.location}</span>}
                  </div>
                  <div>
                    {game.isNew ? (
                      <span className="flex items-center gap-1 text-[10px] bg-green-500/10 text-green-500 px-3 py-1.5 rounded-full font-black uppercase tracking-widest border border-green-500/20">
                        <CheckCircle size={12} /> Novo
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] bg-gray-500/10 text-gray-500 px-3 py-1.5 rounded-full font-black uppercase tracking-widest border border-gray-500/20">
                        <Database size={12} /> No DB
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Form / Confirmation */}
            <div className="p-6 border-t border-white/5 flex gap-4 justify-end bg-[#0a0a0a]">
              <Button onClick={() => setIsOpen(false)} variant="ghost" className="font-bold text-gray-500 hover:text-white uppercase tracking-widest text-xs">
                Cancelar
              </Button>
              <Button 
                onClick={handleImport} 
                disabled={loading}
                className="bg-yellow-500 hover:bg-yellow-400 text-black font-black uppercase tracking-widest text-xs"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2" fill="black" />}
                Confirmar Importação ({activeTab})
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
