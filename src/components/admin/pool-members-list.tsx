"use client";

import { useState, useEffect } from "react";
import { ShieldHalf, ShieldMinus, User, Loader2, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { toggleModeratorAction, getPoolApprovedMembers, removeMemberAction } from "@/app/actions/moderator_actions";

interface Member {
  membershipId: number;
  userId: number;
  memberRole: string;
  name: string;
  email: string;
  image: string | null;
}

interface PoolMembersListProps {
  poolId: number;
  poolName: string;
}

export function PoolMembersList({ poolId, poolName }: PoolMembersListProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  useEffect(() => {
    getPoolApprovedMembers(poolId).then((data) => {
      setMembers(data as Member[]);
      setLoading(false);
    });
  }, [poolId]);

  const handleToggleModerator = async (membershipId: number) => {
    setLoadingId(membershipId);
    try {
      const res = await toggleModeratorAction(membershipId, poolId);
      if (res.success) {
        toast.success(`Papel alterado para: ${res.newRole === "moderator" ? "Moderador" : "Membro"}`);
        setMembers(prev =>
          prev.map(m => m.membershipId === membershipId ? { ...m, memberRole: res.newRole! } : m)
        );
      } else {
        toast.error(res.error || "Erro ao alterar papel.");
      }
    } catch {
      toast.error("Erro interno.");
    } finally {
      setLoadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 text-gray-600">
        <Loader2 size={20} className="animate-spin" />
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">
          Nenhum membro aprovado em {poolName}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2 mt-4">
      {members.map((member) => (
        <div
          key={member.membershipId}
          className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-black/30 border border-white/5 hover:border-white/10 transition-all"
        >
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="h-8 w-8 border border-white/10">
              <AvatarImage src={member.image || ""} />
              <AvatarFallback className="bg-black text-white text-[10px] font-black">
                {member.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white truncate">{member.name}</span>
                {member.memberRole === "moderator" && (
                  <span className="text-[8px] font-black bg-purple-500/20 text-purple-400 border border-purple-500/20 px-1.5 rounded-md uppercase tracking-wide">MOD</span>
                )}
              </div>
              <span className="text-[9px] text-gray-600 truncate">{member.email}</span>
            </div>
          </div>

          <Button
            size="sm"
            onClick={() => handleToggleModerator(member.membershipId)}
            disabled={loadingId === member.membershipId}
            className={`h-8 px-3 rounded-xl text-[9px] font-black uppercase tracking-wide transition-all shrink-0 ${
              member.memberRole === "moderator"
                ? "bg-purple-500/10 text-purple-400 hover:bg-red-500/10 hover:text-red-400 border border-purple-500/20 hover:border-red-500/20"
                : "bg-white/5 text-gray-400 hover:bg-purple-500/10 hover:text-purple-400 border border-white/5 hover:border-purple-500/20"
            }`}
          >
            {loadingId === member.membershipId ? (
              <Loader2 size={12} className="animate-spin" />
            ) : member.memberRole === "moderator" ? (
              <span className="flex items-center gap-1"><ShieldMinus size={12} /> Rebaixar</span>
            ) : (
              <span className="flex items-center gap-1"><ShieldHalf size={12} /> Moderador</span>
            )}
          </Button>

          <Button
            size="sm"
            onClick={async () => {
              if (window.confirm(`Tem certeza que deseja remover ${member.name}?`)) {
                setLoadingId(member.membershipId);
                const res = await removeMemberAction(member.membershipId, poolId);
                if (res.success) {
                  toast.success("Membro removido.");
                  setMembers(prev => prev.filter(m => m.membershipId !== member.membershipId));
                } else {
                  toast.error(res.error || "Erro.");
                }
                setLoadingId(null);
              }
            }}
            disabled={loadingId === member.membershipId}
            className="h-8 px-2 rounded-xl text-[9px] font-black uppercase text-red-500 bg-red-500/10 hover:bg-red-500/20 hover:text-red-400 border border-red-500/20 hover:border-red-500/40"
          >
            remover
          </Button>
        </div>
      ))}
    </div>
  );
}
