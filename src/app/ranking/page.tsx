import db from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Medal, Award, TrendingUp } from "lucide-react";

interface RankingUser {
  id: number;
  name: string;
  image: string | null;
  total_points: number;
}

export default async function RankingPage() {
  const session = await getServerSession(authOptions);
  
  let ranking: RankingUser[] = [];
  let dbError = false;

  try {
    const result = await db("users")
      .leftJoin("guesses", "users.id", "guesses.user_id")
      .select("users.id", "users.name", "users.image")
      .sum("guesses.points_earned as total_points")
      .groupBy("users.id")
      .orderBy("total_points", "desc")
      .orderBy("users.name", "asc");

    ranking = result.map((row: any) => ({
      ...row,
      total_points: Number(row.total_points || 0)
    }));
  } catch (error) {
    console.error("Erro ao buscar ranking:", error);
    dbError = true;
  }

  const currentUserEmail = session?.user?.email;

  const hasPoints = ranking.some(u => u.total_points > 0);

  if (!hasPoints && !dbError) {
    return (
      <div className="flex flex-col items-center justify-center p-8 mt-20 text-center space-y-6">
        <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
          <TrendingUp size={48} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">A Copa ainda não começou!</h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-[280px]">
            Comece a palpitar para subir no ranking. Os pontos serão exibidos assim que os jogos terminarem.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col p-4 pb-20 space-y-6">
      <header className="py-6">
        <h1 className="text-4xl font-extrabold tracking-tight text-white drop-shadow-md">
          Ranking Geral
        </h1>
        <p className="text-sm text-green-100 font-medium py-1 drop-shadow-sm">
          Acompanhe quem está dominando o bolão!
        </p>
      </header>

      <div className="flex flex-col gap-3">
        {ranking.map((user, index) => {
          const isCurrentUser = user.name === session?.user?.name || (currentUserEmail && user.name === currentUserEmail.split('@')[0]); 
          // Note: In a real app, we'd compare IDs properly, but since we're using session.user.name for now in some mocks...
          // Let's try to be more robust if possible.
          
          const rank = index + 1;
          const isTop3 = rank <= 3;
          
          return (
            <div 
              key={user.id}
              className={`flex items-center justify-between p-4 rounded-2xl transition-all border ${
                isCurrentUser 
                  ? "bg-blue-50/80 dark:bg-blue-900/40 border-blue-200 dark:border-blue-800 ring-2 ring-blue-400/20" 
                  : "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800"
              } ${isTop3 ? "shadow-md" : "shadow-sm"}`}
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-8 font-bold text-lg">
                  {rank === 1 && <Medal className="text-yellow-500" size={28} />}
                  {rank === 2 && <Medal className="text-gray-400" size={24} />}
                  {rank === 3 && <Medal className="text-amber-600" size={24} />}
                  {rank > 3 && <span className="text-gray-400">{rank}</span>}
                </div>
                
                <Avatar className={`h-10 w-10 border-2 ${rank === 1 ? 'border-yellow-400' : 'border-transparent'}`}>
                  <AvatarImage src={user.image || ""} />
                  <AvatarFallback className="bg-gray-100 dark:bg-gray-700">
                    {user.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex flex-col">
                  <span className={`font-bold ${isCurrentUser ? "text-blue-700 dark:text-blue-300" : "text-gray-900 dark:text-white"}`}>
                    {user.name}
                    {isCurrentUser && <span className="ml-2 text-[10px] bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-200 px-2 py-0.5 rounded-full uppercase tracking-tighter">Você</span>}
                  </span>
                </div>
              </div>
              
              <div className="flex flex-col items-end">
                <span className="text-xl font-black text-gray-900 dark:text-white">
                  {user.total_points}
                </span>
                <span className="text-[9px] uppercase font-bold text-gray-400 tracking-widest">
                  Pontos
                </span>
              </div>
            </div>
          );
        })}
      </div>
      
      {dbError && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
          <p className="text-sm text-red-700 font-medium">
            Erro ao carregar o ranking. Verifique sua conexão.
          </p>
        </div>
      )}
    </div>
  );
}
