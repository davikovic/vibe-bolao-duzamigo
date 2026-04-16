"use client";

import { useState } from "react";
import { UserCheck, Users, Search, Filter } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { approveUserAction } from "@/app/actions/admin_approval";
import { toggleAdminRoleAction } from "@/app/actions/admin_role";
import { Shield, ShieldAlert, ShieldCheck as ShieldIcon, ShieldCheck } from "lucide-react";

interface PendingUser {
  id: number;
  name: string;
  email: string;
  image: string | null;
  role: "admin" | "user";
}

interface Pool {
  id: number;
  name: string;
}

interface ApproveUsersTabProps {
  pendingUsers: PendingUser[];
  activeUsers: PendingUser[];
  pools: Pool[];
}

export function ApproveUsersTab({ pendingUsers, activeUsers, pools }: ApproveUsersTabProps) {
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [roleLoadingId, setRoleLoadingId] = useState<number | null>(null);
  const [selectedPools, setSelectedPools] = useState<Record<number, number>>(
    Object.fromEntries(pendingUsers.map(u => [u.id, pools[0]?.id]))
  );

  const handleApprove = async (userId: number) => {
    const poolId = selectedPools[userId];
    if (!poolId) {
      toast.error("Selecione um bolão para o usuário.");
      return;
    }

    setLoadingId(userId);
    try {
      const res = await approveUserAction(userId, poolId);
      if (res.success) {
        toast.success("Usuário aprovado com sucesso!");
      } else {
        toast.error(res.error || "Erro ao aprovar usuário.");
      }
    } catch (error) {
      toast.error("Erro interno.");
    } finally {
      setLoadingId(null);
    }
  };

  const handleToggleRole = async (userId: number) => {
    setRoleLoadingId(userId);
    try {
      const res = await toggleAdminRoleAction(userId);
      if (res.success) {
        toast.success(`Usuário agora é ${res.newRole === "admin" ? "Administrador" : "Usuário Comum"}`);
      } else {
        toast.error(res.error || "Erro ao alterar papel.");
      }
    } catch (error) {
      toast.error("Erro interno.");
    } finally {
      setRoleLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <UserCheck className="text-green-500" size={20} />
          <h2 className="text-xl font-black text-white uppercase tracking-tight">Solicitações de Acesso</h2>
        </div>
        <div className="bg-white/5 px-4 py-1.5 rounded-full border border-white/5 text-[10px] font-black text-yellow-500 uppercase tracking-widest">
           {pendingUsers.length} Pendentes
        </div>
      </div>

      <div className="space-y-4">
        {pendingUsers.map((user) => (
          <div 
            key={user.id} 
            className="bg-[#121212] border border-white/5 p-6 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6 transition-all hover:border-white/10 group"
          >
            <div className="flex items-center gap-4">
               <Avatar className="h-14 w-14 border-2 border-white/5">
                 <AvatarImage src={user.image || ""} />
                 <AvatarFallback className="bg-black text-white font-black">
                   {user.name.substring(0, 2).toUpperCase()}
                 </AvatarFallback>
               </Avatar>
               <div className="flex flex-col">
                  <span className="text-lg font-black text-white uppercase tracking-tighter">{user.name}</span>
                  <span className="text-xs font-medium text-gray-500">{user.email}</span>
               </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
               <div className="flex flex-col gap-1 w-full md:w-48">
                  <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest pl-1">Vincular ao Bolão</span>
                  <select 
                    value={selectedPools[user.id]}
                    onChange={(e) => setSelectedPools(prev => ({ ...prev, [user.id]: Number(e.target.value) }))}
                    className="bg-black/40 border border-white/5 rounded-xl px-4 py-2 text-xs font-bold text-white focus:outline-none focus:border-yellow-500/50 appearance-none cursor-pointer"
                  >
                    {pools.map(pool => (
                      <option key={pool.id} value={pool.id}>{pool.name}</option>
                    ))}
                  </select>
               </div>

               <Button 
                 onClick={() => handleApprove(user.id)}
                 disabled={loadingId === user.id}
                 className="w-full md:w-auto bg-green-600 hover:bg-green-500 text-white font-black uppercase tracking-widest text-xs px-8 h-12 rounded-2xl shadow-lg shadow-green-900/10"
               >
                 {loadingId === user.id ? "Processando..." : "Aprovar Acesso"}
               </Button>
            </div>
          </div>
        ))}

        {pendingUsers.length === 0 && (
          <div className="p-20 text-center bg-[#121212] border-2 border-dashed border-white/5 rounded-[3rem] flex flex-col items-center gap-4">
             <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-gray-600">
                <Users size={32} />
             </div>
             <div className="space-y-1">
                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Nenhuma solicitação pendente</p>
                <p className="text-gray-600 font-medium text-[10px]">Novos jogadores aparecerão aqui.</p>
             </div>
          </div>
        )}
      </div>

      {/* Seção de Usuários Ativos / Gestão de Admins */}
      <div className="pt-10 border-t border-white/5">
        <div className="flex items-center gap-3 mb-8 px-2">
          <ShieldIcon className="text-blue-500" size={20} />
          <h2 className="text-xl font-black text-white uppercase tracking-tight">Gerenciar Permissões</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeUsers.map((user) => (
            <div 
              key={user.id} 
              className="bg-[#121212]/50 border border-white/5 p-5 rounded-[2rem] flex items-center justify-between gap-4 transition-all hover:bg-[#121212]"
            >
              <div className="flex items-center gap-3 min-w-0">
                 <Avatar className="h-10 w-10 border border-white/10">
                   <AvatarImage src={user.image || ""} />
                   <AvatarFallback className="bg-black text-white text-[10px] font-black">
                     {user.name.substring(0, 2).toUpperCase()}
                   </AvatarFallback>
                 </Avatar>
                 <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5 min-w-0">
                       <span className="text-sm font-black text-white truncate">{user.name}</span>
                       {user.role === "admin" && (
                          <div className="bg-yellow-500/10 p-0.5 rounded-md border border-yellow-500/20 shadow-[0_0_10px_rgba(234,179,8,0.1)]">
                             <Shield size={10} className="text-yellow-500" fill="currentColor" />
                          </div>
                       )}
                    </div>
                    <span className="text-[10px] font-medium text-gray-600 truncate">{user.email}</span>
                 </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                disabled={roleLoadingId === user.id}
                onClick={() => handleToggleRole(user.id)}
                className={`h-9 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                  user.role === "admin" 
                    ? "bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20" 
                    : "bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white border border-blue-500/20"
                }`}
              >
                {roleLoadingId === user.id 
                  ? "Aguarde..." 
                  : user.role === "admin" ? "Remover Admin" : "Tornar Admin"}
              </Button>
            </div>
          ))}

          {activeUsers.length === 0 && (
            <div className="col-span-full p-10 text-center text-gray-600 font-bold uppercase tracking-widest text-[10px]">
               Nenhum usuário ativo para gerenciar.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
