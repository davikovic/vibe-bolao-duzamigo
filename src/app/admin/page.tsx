import db from "@/lib/db";
import { AdminMatchRow } from "@/components/admin-match-row";
import { Trophy, Globe, PlusCircle, ShieldCheck, UserCheck, Settings2 } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { AdminFifaSync } from "@/components/admin/fifa-sync-button";
import { AdminAddMatchForm } from "@/components/admin/add-match-form";
import { ApproveUsersTab } from "@/components/admin/approve-users-tab";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const session = await getServerSession(authOptions);
  const activeTab = searchParams.tab || "matches";

  // Proteção Robustecida
  if (!session || session.user?.email !== process.env.ADMIN_EMAIL) {
    redirect("/");
  }

  const matches = await db("matches").select("*").orderBy("date", "desc");
  const pendingUsers = await db("users")
    .where({ status: "pending" })
    .select("id", "name", "email", "image", "role");
  
  const activeUsers = await db("users")
    .where({ status: "active" })
    .whereNot({ email: process.env.ADMIN_EMAIL }) // Ocultamos o admin principal para evitar erros
    .select("id", "name", "email", "image", "role");

  const pools = await db("pools").select("id", "name");

  return (
    <div className="flex flex-col gap-10 py-10 px-4 md:px-0 max-w-6xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="text-yellow-500" size={18} />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-500/70">Terminal do Comandante</span>
          </div>
          <h1 className="text-5xl font-black text-white uppercase tracking-tighter">Painel de Controle</h1>
          <p className="text-gray-400 font-medium mt-2">Gerencie resultados, aprove novos jogadores e configure os Bolões.</p>
        </div>

        {activeTab === "matches" && <AdminFifaSync />}
      </header>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 p-1.5 bg-[#121212] border border-white/5 rounded-2xl w-fit">
        <Link 
          href="/admin?tab=matches"
          className={cn(
            "flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
            activeTab === "matches" ? "bg-yellow-500 text-black shadow-lg shadow-yellow-500/10" : "text-gray-500 hover:text-white"
          )}
        >
          <Settings2 size={14} /> Jogos
        </Link>
        <Link 
          href="/admin?tab=users"
          className={cn(
            "flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all relative",
            activeTab === "users" ? "bg-yellow-500 text-black shadow-lg shadow-yellow-500/10" : "text-gray-500 hover:text-white"
          )}
        >
          <UserCheck size={14} /> Usuários
          {pendingUsers.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[8px] flex items-center justify-center text-white border-2 border-black">
               {pendingUsers.length}
            </span>
          )}
        </Link>
      </div>

      {activeTab === "matches" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Lado Esquerdo: Lista de Jogos */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-3 px-2">
              <Trophy className="text-yellow-500/50" size={20} />
              <h2 className="text-xl font-black text-white uppercase tracking-tight">Gerenciar Resultados</h2>
            </div>

            <div className="space-y-4">
              {matches.map((match) => (
                <AdminMatchRow 
                  key={match.id}
                  id={match.id}
                  teamA={match.team_a}
                  teamB={match.team_b}
                  teamAFlag={match.team_a_flag}
                  teamBFlag={match.team_b_flag}
                  initialScoreA={match.score_a}
                  initialScoreB={match.score_b}
                />
              ))}
              
              {matches.length === 0 && (
                <div className="p-20 text-center bg-[#121212] border-2 border-dashed border-white/5 rounded-[3rem] text-gray-500 font-bold uppercase tracking-widest text-xs">
                  Nenhum jogo na base de dados.
                </div>
              )}
            </div>
          </div>

          {/* Lado Direito: Adicionar Manual */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 px-2">
              <PlusCircle className="text-blue-500" size={20} />
              <h2 className="text-xl font-black text-white uppercase tracking-tight">Novo Jogo</h2>
            </div>

            <div className="bg-[#121212] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl sticky top-10">
              <AdminAddMatchForm />
            </div>
          </div>
        </div>
      ) : (
        <ApproveUsersTab 
          pendingUsers={pendingUsers} 
          activeUsers={activeUsers}
          pools={pools} 
        />
      )}
    </div>
  );
}
