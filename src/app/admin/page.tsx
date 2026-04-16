import db from "@/lib/db";
import { AdminMatchRow } from "@/components/admin-match-row";
import { Trophy } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  // Trava de Segurança: Apenas o e-mail definido no .env pode acessar
  if (!session || session.user?.email !== process.env.ADMIN_EMAIL) {
    redirect("/");
  }

  const matches = await db("matches").select("*").orderBy("date", "desc");

  return (
    <div className="flex flex-col p-4 pb-20 space-y-6">
      <header className="py-6">
        <div className="flex items-center gap-2 mb-2">
          <Trophy className="text-yellow-500" />
          <span className="text-xs font-bold uppercase tracking-widest text-yellow-600 dark:text-yellow-500">Área do Administrador</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-white drop-shadow-md">
          Painel de Resultados
        </h1>
        <p className="text-sm text-green-100 font-medium py-1 drop-shadow-sm">
          Insira os placares oficiais para distribuir os pontos.
        </p>
      </header>

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
          <div className="p-10 text-center bg-white/10 rounded-2xl border border-dashed border-white/20 text-white">
            Nenhum jogo encontrado no banco.
          </div>
        )}
      </div>
    </div>
  );
}
