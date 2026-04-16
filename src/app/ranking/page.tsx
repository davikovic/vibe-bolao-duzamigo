import db from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Medal, Star, TrendingUp, Users } from "lucide-react";
import { cookies } from "next/headers";

interface RankingUser {
  id: number;
  name: string;
  image: string | null;
  total_points: number;
}

export default async function RankingPage() {
  const session = await getServerSession(authOptions);
  const cookieStore = await cookies();
  const activePoolId = cookieStore.get("active-pool-id")?.value;
  const poolId = activePoolId ? Number(activePoolId) : (session?.user as any)?.poolId;
  
  let ranking: RankingUser[] = [];
  let poolName = "Geral";
  let dbError = false;

  try {
    if (poolId) {
       const pool = await db("pools").where({ id: poolId }).first();
       if (pool) poolName = pool.name;

       const result = await db("users")
        .join("pool_memberships", "users.id", "pool_memberships.user_id")
        .leftJoin("guesses", "users.id", "guesses.user_id")
        .where({ 
          "pool_memberships.pool_id": poolId,
          "pool_memberships.status": "approved"
        })
        .select("users.id", "users.name", "users.image")
        .sum("guesses.points_earned as total_points")
        .groupBy("users.id")
        .orderBy("total_points", "desc")
        .orderBy("users.name", "asc");

      ranking = result.map((row: any) => ({
        ...row,
        total_points: Number(row.total_points || 0)
      }));
    } else {
      // Fallback para admin ou usuários sem pool associado (mostra todos os ativos)
      const result = await db("users")
        .leftJoin("guesses", "users.id", "guesses.user_id")
        .where({ "users.status": "active" })
        .select("users.id", "users.name", "users.image")
        .sum("guesses.points_earned as total_points")
        .groupBy("users.id")
        .orderBy("total_points", "desc")
        .orderBy("users.name", "asc");

      ranking = result.map((row: any) => ({
        ...row,
        total_points: Number(row.total_points || 0)
      }));
    }
  } catch (error) {
    console.error("Erro ao buscar ranking:", error);
    dbError = true;
  }

  const currentUserEmail = session?.user?.email;

  // Separa os 3 primeiros para o podium
  const topThree = ranking.slice(0, 3);
  const theRest = ranking.slice(3);

  const hasPoints = ranking.some(u => u.total_points > 0);

  if (!hasPoints && !dbError) {
    return (
      <div className="flex flex-col items-center justify-center p-8 mt-20 text-center space-y-8 bg-[#121212]/50 border border-white/5 rounded-[3rem] max-w-2xl mx-auto">
        <div className="w-32 h-32 bg-yellow-500/10 rounded-full flex items-center justify-center text-yellow-500 relative">
          <div className="absolute inset-0 bg-yellow-500/20 blur-3xl rounded-full" />
          <Trophy size={64} className="relative z-10" />
        </div>
        <div className="space-y-4">
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter">O Trono está Vago!</h2>
          <p className="text-gray-400 font-medium max-w-sm mx-auto">
            A temporada ainda não começou. Prepare seus palpites para ser o primeiro a gravar seu nome no topo do Ranking Duzamigo.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 py-6 px-4 md:px-0">
      <header className="py-4">
        <div className="flex items-center gap-3 mb-2">
           <div className="w-10 h-10 bg-yellow-500/10 rounded-xl flex items-center justify-center border border-yellow-500/20">
              <Trophy className="text-yellow-500" size={20} />
           </div>
           <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Ranking {poolName}</h1>
        </div>
        <p className="text-gray-400 font-medium ml-1">Quem será o grande campeão deste grupo?</p>
      </header>

      {/* Bento Layout - Top 3 Podium */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {topThree.map((user, index) => {
          const rank = index + 1;
          const isCurrentUser = user.name === session?.user?.name;
          
          return (
            <div 
              key={user.id} 
              className={`relative overflow-hidden p-8 rounded-[2.5rem] border flex flex-col items-center text-center transition-all hover:scale-[1.02] duration-300 ${
                rank === 1 
                  ? "bg-gradient-to-br from-yellow-500/20 via-yellow-600/10 to-transparent border-yellow-500/30 md:scale-110 md:z-10 shadow-[0_20px_50px_rgba(234,179,8,0.1)]" 
                  : "bg-[#121212]/80 border-white/5"
              }`}
            >
              {rank === 1 && (
                <div className="absolute top-4 right-4 text-yellow-500 opacity-50">
                  <Star fill="currentColor" size={20} />
                </div>
              )}
              
              <div className="relative mb-6">
                 <div className={`absolute -inset-4 rounded-full blur-2xl opacity-40 ${
                   rank === 1 ? "bg-yellow-500" : rank === 2 ? "bg-gray-400" : "bg-amber-700"
                 }`} />
                 <Avatar className={`h-24 w-24 border-4 relative z-10 ${
                   rank === 1 ? 'border-yellow-500' : rank === 2 ? 'border-gray-400' : 'border-amber-700'
                 }`}>
                  <AvatarImage src={user.image || ""} />
                  <AvatarFallback className="text-2xl font-black bg-black text-white">
                    {user.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className={`absolute -bottom-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center text-black font-black text-sm z-20 shadow-lg ${
                  rank === 1 ? "bg-yellow-500" : rank === 2 ? "bg-gray-400" : "bg-amber-700"
                }`}>
                   #{rank}
                </div>
              </div>

              <div className="flex flex-col mb-4">
                 <span className="text-xl font-black text-white uppercase tracking-tighter line-clamp-1">{user.name}</span>
                 {isCurrentUser && <span className="text-[9px] font-black text-yellow-500 uppercase tracking-widest mt-1">Você</span>}
              </div>

              <div className="bg-black/40 px-6 py-2 rounded-2xl border border-white/5">
                 <span className="text-3xl font-black text-white mr-1">{user.total_points}</span>
                 <span className="text-[10px] uppercase font-bold text-gray-500 tracking-tighter">PTS</span>
              </div>
            </div>
          );
        })}
      </section>

      {/* Lista do Restante */}
      <section className="bg-[#0d0d0d] rounded-[2.5rem] border border-white/5 overflow-hidden">
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <Users className="text-gray-500" size={20} />
              <h3 className="font-black text-lg text-white uppercase tracking-tighter">O Restante da Tabela</h3>
           </div>
           <span className="text-xs font-bold text-gray-500 italic">Atualizado em tempo real</span>
        </div>

        <div className="flex flex-col divide-y divide-white/5">
          {theRest.map((user, index) => {
            const rank = index + 4;
            const isCurrentUser = user.name === session?.user?.name;
            
            return (
              <div 
                key={user.id} 
                className={`flex items-center justify-between p-6 hover:bg-white/5 transition-colors ${
                  isCurrentUser ? "bg-yellow-500/5" : ""
                }`}
              >
                <div className="flex items-center gap-6">
                   <span className="w-6 text-sm font-black text-gray-600">#{rank}</span>
                   <Avatar className="h-10 w-10 border border-white/10">
                    <AvatarImage src={user.image || ""} />
                    <AvatarFallback className="font-bold bg-black text-white text-xs">
                      {user.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className={`font-bold text-sm ${isCurrentUser ? "text-yellow-500" : "text-white"}`}>
                      {user.name}
                    </span>
                    {isCurrentUser && <span className="text-[8px] font-black text-yellow-500/60 uppercase">Sua Posição</span>}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                   <div className="flex flex-col items-end">
                      <span className="text-xl font-black text-white">{user.total_points}</span>
                   </div>
                   <TrendingUp className="text-green-500/30" size={16} />
                </div>
              </div>
            );
          })}

          {theRest.length === 0 && ranking.length > 0 && (
             <div className="p-10 text-center text-gray-600 text-xs font-bold uppercase tracking-widest italic">
                A luta pelo Top 3 está intensa!
             </div>
          )}
        </div>
      </section>

      {dbError && (
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl text-red-500 text-xs font-bold text-center">
          Falha na conexão com o banco. Ranking offline.
        </div>
      )}
    </div>
  );
}
