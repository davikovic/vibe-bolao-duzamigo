import { GameCard } from "@/components/game-card";
import db from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Trophy, Timer, Zap, Flame, Info } from "lucide-react";
import { cookies } from "next/headers";

const MOCK_GAMES = [
  {
    id: "g1",
    team_a: "Brasil",
    team_b: "Argentina",
    team_a_flag: "🇧🇷",
    team_b_flag: "🇦🇷",
    date: new Date("2026-06-20T16:00:00Z"),
    group_name: "Grupo A",
  },
  {
    id: "g2",
    team_a: "França",
    team_b: "Alemanha",
    team_a_flag: "🇫🇷",
    team_b_flag: "🇩🇪",
    date: new Date("2026-06-21T13:00:00Z"),
    group_name: "Grupo B",
  },
  {
    id: "g3",
    team_a: "Espanha",
    team_b: "Portugal",
    team_a_flag: "🇪🇸",
    team_b_flag: "🇵🇹",
    date: new Date("2026-06-22T16:00:00Z"),
    group_name: "Grupo C",
  },
];

export default async function Home() {
  let matches: any[] = [];
  let userGuessesMap: Record<number, { a: number; b: number }> = {};
  let poolName = "";
  let poolDescription = "";
  let poolPrize = "";
  let dbError = false;

  try {
    const session = await getServerSession(authOptions);
    const cookieStore = await cookies();
    const activePoolId = cookieStore.get("active-pool-id")?.value;
    const poolId = activePoolId ? Number(activePoolId) : (session?.user as any)?.poolId;

    if (poolId) {
      const pool = await db("pools").where({ id: poolId }).first();
      if (pool) {
        poolName = pool.name;
        poolDescription = pool.description;
        poolPrize = pool.prize_info;
      }
    }

    const result = await db("matches").select("*").orderBy("date", "asc");
    if (result && result.length > 0) {
      matches = result;

      if (session?.user?.email) {
        const user = await db("users").where({ email: session.user.email }).first();
        if (user) {
          const guesses = await db("guesses").where({ user_id: user.id });
          guesses.forEach((g: any) => {
            userGuessesMap[g.match_id] = { a: g.guess_a, b: g.guess_b };
          });
        }
      }
    } else {
      matches = MOCK_GAMES;
    }
  } catch (error) {
    dbError = true;
    matches = MOCK_GAMES;
  }

  // Encontra o primeiro jogo que ainda não começou para o Hero
  const now = new Date();
  const heroMatch = matches.find(m => new Date(m.date) > now && m.score_a === null) || matches[0];
  const otherMatches = matches.filter(m => m.id !== heroMatch.id);

  const formatDate = (dateInput: any) => {
    const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col gap-10 py-6 px-4 md:px-0">
      {/* Hero Section - Próximo Grande Jogo */}
      <section className="relative w-full overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-yellow-600/20 via-black to-black border border-white/5 p-8 md:p-12">
        <div className="absolute top-0 right-0 p-8 opacity-10">
           <Trophy size={180} className="text-yellow-500 rotate-12" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
           <div className="flex flex-col max-w-md text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                 <div className="bg-yellow-500 px-3 py-1 rounded-full text-[10px] font-black text-black uppercase tracking-widest flex items-center gap-1">
                    <Zap size={10} fill="black" /> Destaque da Rodada
                 </div>
                 <div className="text-gray-400 text-xs font-bold uppercase tracking-wider">{heroMatch.group_name}</div>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tighter leading-tight">
                É HORA DO <span className="text-yellow-500 gold-glow underline decoration-yellow-500/30 underline-offset-8">SHOW.</span>
              </h1>
              
              <p className="text-gray-400 font-medium mb-8">
                O clássico está chegando. Garanta sua posição no ranking com o seu melhor palpite!
              </p>

              <div className="flex items-center justify-center md:justify-start gap-4">
                 <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-500 uppercase mb-1">Inicia em</span>
                    <div className="flex items-center gap-2 text-2xl font-black text-white">
                       <Timer size={20} className="text-yellow-500" />
                       {formatDate(heroMatch.date).split(' ')[1]}
                    </div>
                 </div>
              </div>
           </div>

           <div className="w-full md:w-auto min-w-[320px] md:min-w-[420px]">
              <GameCard
                id={String(heroMatch.id)}
                date={formatDate(heroMatch.date)}
                group={heroMatch.group_name}
                teamA={{ id: heroMatch.team_a, name: heroMatch.team_a, flag: heroMatch.team_a_flag }}
                teamB={{ id: heroMatch.team_b, name: heroMatch.team_b, flag: heroMatch.team_b_flag }}
                initialGuessA={userGuessesMap[heroMatch.id]?.a}
                initialGuessB={userGuessesMap[heroMatch.id]?.b}
                isLocked={new Date() > new Date(heroMatch.date)}
                isFinished={heroMatch.score_a !== null}
                finalScoreA={heroMatch.score_a}
                finalScoreB={heroMatch.score_b}
              />
           </div>
        </div>
      </section>

      {/* Info Card - Premiação e Bolão */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-6">
         <div className="md:col-span-8 bg-[#121212] border border-white/5 rounded-[2rem] p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 blur-3xl -mr-10 -mt-10" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
               <div className="flex flex-col">
                  <div className="flex items-center gap-3 mb-3">
                     <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
                        <Trophy className="text-yellow-500" size={20} />
                     </div>
                     <span className="text-xs font-black text-white uppercase tracking-widest">🏆 Premiação em Jogo</span>
                  </div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">{poolName || "Carregando..."}</h3>
                  <p className="text-gray-400 font-medium text-sm max-w-lg">
                     {poolPrize || "A premiação deste bolão está sendo definida pela organização. Fique atento!"}
                  </p>
               </div>
               <div className="flex flex-col items-center justify-center p-6 bg-white/5 rounded-2xl border border-white/5 min-w-[120px]">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Status</span>
                  <span className="text-sm font-black text-yellow-500 uppercase tracking-widest">Ativo</span>
               </div>
            </div>
         </div>

         <div className="md:col-span-4 bg-gradient-to-br from-blue-600/20 to-transparent border border-white/5 rounded-[2rem] p-8 flex flex-col justify-center gap-3 relative overflow-hidden group">
            <div className="flex items-center gap-2 mb-2">
               <Info className="text-blue-500" size={16} />
               <span className="text-[10px] font-bold text-blue-500/70 uppercase tracking-widest">Informativo</span>
            </div>
            <p className="text-xs font-bold text-gray-300 leading-relaxed">
               {poolDescription || "Você está participando do bolão oficial do Duzamigo."}
            </p>
         </div>
      </section>

      {/* Grid de Outros Jogos */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
                 <Flame className="text-orange-500" />
              </div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">Próximas Partidas</h2>
           </div>
           {poolName && (
              <div className="hidden md:flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 px-4 py-1.5 rounded-full shadow-[0_0_15px_rgba(234,179,8,0.05)]">
                 <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse" />
                 <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">{poolName}</span>
              </div>
           )}
           <button className="text-[10px] font-black uppercase tracking-widest text-yellow-500/60 hover:text-yellow-500 transition-colors">Ver Todos</button>
        </div>

        {dbError && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-3xl text-yellow-500 text-xs font-bold text-center">
            Usando dados de demonstração. Conecte seu banco de dados para ativar o sistema real.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {otherMatches.map((game) => {
            const gameDate = typeof game.date === "string" ? new Date(game.date) : game.date;
            const dateStr = formatDate(gameDate);
            const isLocked = new Date() > gameDate;
            const isFinished = game.score_a !== null && game.score_b !== null;

            return (
              <GameCard
                key={game.id}
                id={String(game.id)}
                date={dateStr}
                group={game.group_name}
                teamA={{ id: game.team_a, name: game.team_a, flag: game.team_a_flag }}
                teamB={{ id: game.team_b, name: game.team_b, flag: game.team_b_flag }}
                initialGuessA={userGuessesMap[game.id]?.a}
                initialGuessB={userGuessesMap[game.id]?.b}
                isLocked={isLocked}
                isFinished={isFinished}
                finalScoreA={game.score_a}
                finalScoreB={game.score_b}
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}
