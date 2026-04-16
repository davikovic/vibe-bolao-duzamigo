"use client";

import { useState } from "react";
import { Trophy, Info, UserPlus, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { requestPoolAccess } from "@/app/actions/pool_actions";
import { cn } from "@/lib/utils";

interface Pool {
  id: number;
  name: string;
  description: string;
  prize_info: string;
  status: string; // none, pending, approved
}

export function PoolExploreCard({ pool }: { pool: Pool }) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(pool.status);

  const handleRequest = async () => {
    setLoading(true);
    try {
      const res = await requestPoolAccess(pool.id);
      if (res.success) {
        toast.success("Solicitação enviada!");
        setStatus("pending");
      } else {
        toast.error(res.error || "Erro ao solicitar.");
      }
    } catch (error) {
      toast.error("Erro interno.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#121212] border border-white/5 p-8 rounded-[2.5rem] flex flex-col justify-between transition-all hover:border-white/10 group relative overflow-hidden">
      {status === "approved" && (
        <div className="absolute top-0 right-0 p-4">
           <div className="bg-green-500/10 text-green-500 border border-green-500/20 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5">
              <CheckCircle2 size={10} /> Participando
           </div>
        </div>
      )}

      <div>
        <div className="flex items-center gap-4 mb-6">
           <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5 group-hover:border-yellow-500/20 group-hover:bg-yellow-500/5 transition-all">
              <Trophy className="text-yellow-500/40 group-hover:text-yellow-500 transition-colors" size={24} />
           </div>
           <div className="flex flex-col">
              <h3 className="text-xl font-black text-white uppercase tracking-tighter">{pool.name}</h3>
              <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">ID: #{pool.id}</span>
           </div>
        </div>

        <p className="text-xs text-gray-400 font-medium leading-relaxed mb-6">
          {pool.description || "Nenhuma descrição disponível para este bolão."}
        </p>

        <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex items-start gap-3 mb-8">
           <Info className="text-gray-500 shrink-0" size={16} />
           <div className="flex flex-col">
              <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Premiação</span>
              <p className="text-[10px] text-gray-300 font-bold mt-0.5">{pool.prize_info || "A confirmar."}</p>
           </div>
        </div>
      </div>

      <div>
        {status === "none" && (
          <Button 
            onClick={handleRequest}
            disabled={loading}
            className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-black uppercase tracking-widest text-xs h-14 rounded-2xl shadow-lg shadow-yellow-900/10"
          >
            {loading ? "Processando..." : (
              <span className="flex items-center gap-2">
                Solicitar Participação <UserPlus size={16} />
              </span>
            )}
          </Button>
        )}

        {status === "pending" && (
          <Button 
            disabled
            className="w-full bg-white/5 text-gray-500 border border-white/5 font-black uppercase tracking-widest text-xs h-14 rounded-2xl cursor-not-allowed"
          >
            <span className="flex items-center gap-2">
              Aguardando Aprovação <Clock size={16} />
            </span>
          </Button>
        )}

        {status === "approved" && (
          <a
            href="/"
            className="flex items-center justify-center w-full bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-xs h-14 rounded-2xl transition-colors"
          >
            Acessar Dashboard
          </a>
        )}
      </div>
    </div>
  );
}
