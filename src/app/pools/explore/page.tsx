import { getPoolExploreData } from "@/app/actions/pool_actions";
import { Globe } from "lucide-react";
import { PoolExploreCard } from "@/components/pools/pool-explore-card";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function ExplorePoolsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/login");
  }

  const pools = await getPoolExploreData();

  return (
    <div className="flex flex-col gap-10 py-10 px-4 md:px-0 max-w-5xl mx-auto">
      <header>
         <div className="flex items-center gap-2 mb-2">
            <Globe className="text-blue-500" size={18} />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500/70">Descoberta Global</span>
         </div>
         <h1 className="text-5xl font-black text-white uppercase tracking-tighter">Explorar Bolões</h1>
         <p className="text-gray-400 font-medium mt-2">Encontre e participe de novos bolões do Duzamigo.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {pools.map((pool: any) => (
          <PoolExploreCard key={pool.id} pool={pool} />
        ))}
      </div>

      {pools.length === 0 && (
        <div className="p-20 text-center bg-[#121212] border-2 border-dashed border-white/5 rounded-[3rem] text-gray-500 font-bold uppercase tracking-widest text-xs">
          Nenhum bolão disponível no momento.
        </div>
      )}
    </div>
  );
}
