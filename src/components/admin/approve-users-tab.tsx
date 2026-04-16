"use client";

import { useState } from "react";
import { UserCheck, Users, Search, Filter } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { approveUserAction, approveMembershipAction, rejectMembershipAction } from "@/app/actions/admin_approval";
import { Shield, ShieldAlert, ShieldCheck as ShieldIcon, Check, X } from "lucide-react";

interface PendingUser {
  id: number;
  name: string;
  email: string;
  image: string | null;
  role: "admin" | "user";
}

interface PendingMembership {
  id: number;
  userId: number;
  name: string;
  email: string;
  image: string | null;
  poolName: string;
  poolId: number;
}

interface Pool {
  id: number;
  name: string;
}

interface ApproveUsersTabProps {
  pendingUsers: PendingUser[];
  pendingMemberships: PendingMembership[];
  activeUsers: PendingUser[];
  pools: Pool[];
}

export function ApproveUsersTab({ pendingUsers, pendingMemberships, activeUsers, pools }: ApproveUsersTabProps) {
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [membershipLoadingId, setMembershipLoadingId] = useState<number | null>(null);
  const [roleLoadingId, setRoleLoadingId] = useState<number | null>(null);
  const [selectedPools, setSelectedPools] = useState<Record<number, number>>(
    Object.fromEntries(pendingUsers.map(u => [u.id, pools[0]?.id]))
  );

  const handleApproveUser = async (userId: number) => {
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

  const handleApproveMembership = async (membershipId: number) => {
    setMembershipLoadingId(membershipId);
    try {
      const res = await approveMembershipAction(membershipId);
      if (res.success) {
        toast.success("Solicitação aprovada!");
      } else {
        toast.error(res.error || "Erro ao aprovar.");
      }
    } catch (error) {
      toast.error("Erro interno.");
    } finally {
      setMembershipLoadingId(null);
    }
  };

  const handleRejectMembership = async (membershipId: number) => {
    if (!confirm("Tem certeza que deseja rejeitar esta solicitação?")) return;
    
    setMembershipLoadingId(membershipId);
    try {
      const res = await rejectMembershipAction(membershipId);
      if (res.success) {
        toast.success("Solicitação rejeitada.");
      } else {
        toast.error(res.error || "Erro ao rejeitar.");
      }
    } catch (error) {
      toast.error("Erro interno.");
    } finally {
      setMembershipLoadingId(null);
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

  const groupedMemberships = pendingMemberships.reduce((acc, curr) => {
    if (!acc[curr.poolName]) acc[curr.poolName] = [];
    acc[curr.poolName].push(curr);
    return acc;
  }, {} as Record<string, PendingMembership[]>);

  return (
    <div className="space-y-12">
      {/* 1. Solicitações por Bolão */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <Users className="text-blue-500" size={20} />
            <h2 className="text-xl font-black text-white uppercase tracking-tight">Pendências por Bolão</h2>
          </div>
          <div className="bg-blue-500/10 px-4 py-1.5 rounded-full border border-blue-500/10 text-[10px] font-black text-blue-500 uppercase tracking-widest">
             {pendingMemberships.length} Solicitações
          </div>
        </div>

        {Object.entries(groupedMemberships).map(([poolName, members]) => (
          <div key={poolName} className="space-y-4">
             <div className="flex items-center gap-2 px-2">
                <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full" />
                <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">{poolName}</h3>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {members.map((m) => (
                  <div key={m.id} className="bg-[#121212] border border-white/5 p-4 rounded-3xl flex items-center justify-between gap-4 transition-all hover:border-white/10 group">
                    <div className="flex items-center gap-3 min-w-0">
                       <Avatar className="h-10 w-10 border border-white/5">
                         <AvatarImage src={m.image || ""} />
                         <AvatarFallback className="bg-black text-white text-[10px] font-black">{m.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                       </Avatar>
                       <div className="flex flex-col min-w-0">
                          <span className="text-sm font-black text-white truncate">{m.name}</span>
                          <span className="text-[10px] font-medium text-gray-600 truncate">{m.email}</span>
                       </div>
                    </div>
                    <div className="flex items-center gap-2">
                       <Button
                         size="sm"
                         onClick={() => handleApproveMembership(m.id)}
                         disabled={membershipLoadingId === m.id}
                         className="h-9 w-9 p-0 bg-green-600/10 text-green-500 hover:bg-green-600 hover:text-white border border-green-600/20 rounded-xl"
                       >
                         <Check size={16} />
                       </Button>
                       <Button
                         size="sm"
                         onClick={() => handleRejectMembership(m.id)}
                         disabled={membershipLoadingId === m.id}
                         className="h-9 w-9 p-0 bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white border border-red-600/20 rounded-xl"
                       >
                         <X size={16} />
                       </Button>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        ))}

        {pendingMemberships.length === 0 && (
          <div className="p-10 text-center bg-[#121212]/50 border border-white/5 rounded-[2rem] text-gray-600 font-bold uppercase tracking-widest text-[10px]">
             Nenhuma solicitação de bolão pendente.
          </div>
        )}
      </section>

      {/* 2. Novos Usuários (Sem bolão algum) */}
      <section className="space-y-6 pt-6 border-t border-white/5">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <UserCheck className="text-yellow-500" size={20} />
            <h2 className="text-xl font-black text-white uppercase tracking-tight">Novos Cadastros</h2>
          </div>
          <div className="bg-yellow-500/10 px-4 py-1.5 rounded-full border border-yellow-500/10 text-[10px] font-black text-yellow-500 uppercase tracking-widest">
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
                   onClick={() => handleApproveUser(user.id)}
                   disabled={loadingId === user.id}
                   className="w-full md:w-auto bg-green-600 hover:bg-green-500 text-white font-black uppercase tracking-widest text-xs px-8 h-12 rounded-2xl shadow-lg shadow-green-900/10"
                 >
                   {loadingId === user.id ? "Processando..." : "Aprovar e Vincular"}
                 </Button>
              </div>
            </div>
          ))}

          {pendingUsers.length === 0 && (
            <div className="p-10 text-center text-gray-600 font-bold uppercase tracking-widest text-[10px]">
               Atualmente não há novos cadastros aguardando aprovação total.
            </div>
          )}
        </div>
      </section>

      {/* 3. Gestão de Admins */}
      <section className="pt-10 border-t border-white/5">
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
        </div>
      </section>
    </div>
  );
}
