import db from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { redirect } from "next/navigation";
import { User, Mail, History, Award, CheckCircle2, XCircle, Info, Loader2, Target } from "lucide-react";
import { SignOutButton } from "@/components/auth/sign-out-button";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const user = await db("users").where({ email: session.user?.email }).first();
  
  if (!user) {
    return <div className="p-8 text-white font-black uppercase tracking-widest text-center mt-20">Usuário não encontrado.</div>;
  }

  const guesses = await db("guesses")
    .join("matches", "guesses.match_id", "matches.id")
    .where({ user_id: user.id })
    .select(
      "guesses.*",
      "matches.team_a",
      "matches.team_b",
      "matches.team_a_flag",
      "matches.team_b_flag",
      "matches.score_a as real_a",
      "matches.score_b as real_b"
    )
    .orderBy("matches.date", "desc");

  const totalPoints = guesses.reduce((sum, g) => sum + (g.points_earned || 0), 0);
  const avatarUrl = session.user?.image || `https://api.dicebear.com/7.x/bottts/svg?seed=${session.user?.email || 'default'}`;

  return (
    <div className="flex flex-col gap-10 py-6 px-4 md:px-0 max-w-5xl mx-auto">
      {/* Header do Perfil - Style Hero */}
      <header className="relative overflow-hidden rounded-[3rem] bg-[#121212] border border-white/5 p-8 md:p-12 flex flex-col md:flex-row items-center gap-10">
        <div className="absolute top-0 right-0 p-12 opacity-5">
           <User size={150} className="text-white" />
        </div>
        
        <div className="relative z-10">
          <div className="relative group">
            <div className="absolute -inset-2 bg-yellow-500 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity rounded-full" />
            <Avatar className="h-32 w-32 border-4 border-yellow-500/30 relative z-10 shadow-[0_0_30px_rgba(234,179,8,0.3)]">
              <AvatarImage src={avatarUrl} className="object-cover" />
              <AvatarFallback className="text-3xl font-black bg-black text-white">
                {session.user?.name?.substring(0, 2).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        <div className="relative z-10 flex flex-col items-center md:items-start text-center md:text-left">
           <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">
             {session.user?.name}
           </h1>
           <div className="flex items-center gap-2 text-gray-400 font-medium mb-6">
              <Mail size={14} className="text-yellow-500/50" />
              <span className="text-sm">{session.user?.email}</span>
           </div>

           <div className="flex items-center gap-4">
              <div className="bg-white/5 px-4 py-2 rounded-2xl border border-white/5 flex flex-col items-center min-w-[100px]">
                 <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Palpites</span>
                 <span className="text-xl font-black text-white">{guesses.length}</span>
              </div>
              <div className="bg-yellow-500/10 px-4 py-2 rounded-2xl border border-yellow-500/10 flex flex-col items-center min-w-[100px]">
                 <span className="text-[9px] font-black text-yellow-500/60 uppercase tracking-widest mb-1">Pontos</span>
                 <span className="text-xl font-black text-yellow-500">
                   {totalPoints}
                 </span>
              </div>
           </div>

           {/* Botão de Logout apenas Mobile */}
           <div className="w-full mt-6 md:hidden">
              <SignOutButton />
           </div>
        </div>
      </header>

      {/* Histórico de Palpites - Style List Premium */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 px-2">
           <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
              <History className="text-blue-500" size={20} />
           </div>
           <h2 className="text-2xl font-black text-white uppercase tracking-tight">Histórico de Atividade</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {guesses.map((guess) => {
            const isProcessed = guess.points_earned !== null;
            
            return (
              <div key={guess.id} className="bg-[#121212]/60 backdrop-blur-xl border border-white/5 p-6 rounded-[2rem] transition-all hover:border-white/10 group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                   <Target size={40} className="text-white" />
                </div>

                <div className="flex items-center justify-between mb-8 relative z-10">
                  <div className="flex items-center gap-2">
                     <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                     <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Palpite Confirmado</span>
                  </div>
                  
                  {isProcessed ? (
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                      guess.points_earned === 3 
                        ? "bg-green-500/20 text-green-500 shadow-[0_0_15px_rgba(34,197,94,0.1)]" 
                        : guess.points_earned === 1 
                          ? "bg-blue-500/20 text-blue-500" 
                          : "bg-gray-500/20 text-gray-500"
                    }`}>
                      {guess.points_earned === 3 ? <CheckCircle2 size={12} /> : guess.points_earned === 1 ? <Info size={12} /> : <XCircle size={12} />}
                      {guess.points_earned} {guess.points_earned === 1 ? 'Ponto' : 'Pontos'}
                    </div>
                  ) : (
                    <span className="text-[9px] font-black text-yellow-500/40 uppercase tracking-widest flex items-center gap-1.5">
                       <Loader2 size={10} className="animate-spin" /> Aguardando Resultado
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between gap-4 mb-2 relative z-10">
                  {/* Team A */}
                  <div className="flex flex-col items-center flex-1 gap-3">
                    <div className="w-12 h-8 rounded-sm overflow-hidden border border-white/10 bg-black/40 shadow-lg">
                      <img src={guess.team_a_flag} alt={guess.team_a} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[10px] font-black text-white uppercase tracking-tighter text-center line-clamp-1">{guess.team_a}</span>
                  </div>

                  {/* Guess Display */}
                  <div className="flex flex-col items-center gap-1 min-w-[80px]">
                     <span className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">Palpite</span>
                     <div className="flex items-center gap-3 bg-black/40 px-4 py-1.5 rounded-xl border border-white/5">
                        <span className="text-xl font-black text-white">{guess.guess_a}</span>
                        <span className="text-yellow-500 text-xs font-bold">:</span>
                        <span className="text-xl font-black text-white">{guess.guess_b}</span>
                     </div>
                  </div>

                  {/* Team B */}
                  <div className="flex flex-col items-center flex-1 gap-3">
                    <div className="w-12 h-8 rounded-sm overflow-hidden border border-white/10 bg-black/40 shadow-lg">
                      <img src={guess.team_b_flag} alt={guess.team_b} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[10px] font-black text-white uppercase tracking-tighter text-center line-clamp-1">{guess.team_b}</span>
                  </div>
                </div>

                {isProcessed && (
                  <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between transition-opacity relative z-10 text-[10px] font-bold">
                    <span className="text-gray-500 uppercase tracking-widest">Placar Oficial</span>
                    <div className="flex items-center gap-2">
                       <span className="text-white bg-white/5 px-2 py-0.5 rounded-md">{guess.real_a}</span>
                       <span className="text-yellow-500/50">:</span>
                       <span className="text-white bg-white/5 px-2 py-0.5 rounded-md">{guess.real_b}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {guesses.length === 0 && (
            <div className="col-span-full py-20 text-center bg-[#121212]/50 border border-dashed border-white/5 rounded-[2.5rem] flex flex-col items-center gap-4">
              <Award size={48} className="text-gray-700" />
              <div className="flex flex-col gap-1">
                 <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Nenhum palpite enviado</p>
                 <p className="text-gray-600 font-medium text-[10px]">As estatísticas aparecerão assim que você começar a jogar.</p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
