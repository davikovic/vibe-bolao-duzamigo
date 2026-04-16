import db from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { redirect } from "next/navigation";

// Sub-componente para os cards de UI do shadcn que talvez não existam ainda
// Vou usar divs estilizadas para garantir que nada quebre caso shadcn card não esteja instalado
export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const user = await db("users").where({ email: session.user?.email }).first();
  
  if (!user) {
    return <div className="p-8 text-white">Usuário não encontrado.</div>;
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

  return (
    <div className="flex flex-col p-4 pb-20 space-y-6">
      <header className="py-10 flex flex-col items-center">
        <Avatar className="h-24 w-24 border-4 border-white/20 shadow-xl mb-4">
          <AvatarImage src={session.user?.image || ""} />
          <AvatarFallback className="text-2xl font-bold bg-emerald-600 text-white">
            {session.user?.name?.substring(0, 2).toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        <h1 className="text-2xl font-black text-white drop-shadow-md">
          {session.user?.name}
        </h1>
        <p className="text-emerald-100/70 text-sm font-medium">
          {session.user?.email}
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-white px-2">Seus últimos palpites</h2>
        
        <div className="flex flex-col gap-3">
          {guesses.map((guess) => {
            const isProcessed = guess.points_earned !== null;
            
            return (
              <div key={guess.id} className="bg-white/95 dark:bg-gray-900 shadow-lg rounded-2xl p-4 border border-white/10">
                <div className="flex items-center justify-between mb-3 border-b border-gray-100 dark:border-gray-800 pb-2">
                  <span className="text-[10px] font-bold uppercase text-gray-400">
                    {guess.team_a} vs {guess.team_b}
                  </span>
                  
                  {isProcessed ? (
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                      guess.points_earned === 3 
                        ? "bg-green-100 text-green-700" 
                        : guess.points_earned === 1 
                          ? "bg-blue-100 text-blue-700" 
                          : "bg-gray-100 text-gray-400"
                    }`}>
                      {guess.points_earned} {guess.points_earned === 1 ? 'Ponto' : 'Pontos'}
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-gray-300 uppercase">Aguardando</span>
                  )}
                </div>

                <div className="flex items-center justify-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{guess.team_a_flag}</span>
                    <span className="text-xl font-bold text-gray-800 dark:text-gray-100">{guess.guess_a}</span>
                  </div>
                  
                  <span className="text-gray-300 font-bold">X</span>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-gray-800 dark:text-gray-100">{guess.guess_b}</span>
                    <span className="text-lg">{guess.team_b_flag}</span>
                  </div>
                </div>

                {isProcessed && (
                  <div className="mt-3 text-center text-[9px] font-bold text-gray-400 border-t border-gray-50 pt-2">
                    Resultado Real: {guess.real_a} x {guess.real_b}
                  </div>
                )}
              </div>
            );
          })}

          {guesses.length === 0 && (
            <div className="p-8 text-center text-emerald-100/50 italic border border-dashed border-emerald-100/20 rounded-2xl">
              Você ainda não fez nenhum palpite. 
              Corra para a página inicial!
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
