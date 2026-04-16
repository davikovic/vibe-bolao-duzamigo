"use server";

import db from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function getApprovedPools() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return [];

  const user = await db("users").where({ email: session.user.email }).first();
  if (!user) return [];

  const approvedPools = await db("pools")
    .join("pool_memberships", "pools.id", "pool_memberships.pool_id")
    .where({ "pool_memberships.user_id": user.id, "pool_memberships.status": "approved" })
    .select("pools.*");

  return approvedPools;
}

export async function getPoolExploreData() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return [];

  const user = await db("users").where({ email: session.user.email }).first();
  if (!user) return [];

  const pools = await db("pools").select("*");
  const memberships = await db("pool_memberships").where({ user_id: user.id });

  return pools.map(pool => {
    const membership = memberships.find(m => m.pool_id === pool.id);
    return {
      ...pool,
      status: membership ? membership.status : "none", // approved, pending, none
    };
  });
}

export async function requestPoolAccess(poolId: number) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { error: "Não autorizado" };

  const user = await db("users").where({ email: session.user.email }).first();
  if (!user) return { error: "Usuário não encontrado" };

  try {
    const existing = await db("pool_memberships").where({ user_id: user.id, pool_id: poolId }).first();
    if (existing) return { error: "Solicitação já existe" };

    await db("pool_memberships").insert({
      user_id: user.id,
      pool_id: poolId,
      status: "pending",
      role: "member"
    });

    revalidatePath("/pools/explore");
    return { success: true };
  } catch (error) {
    console.error("Erro ao solicitar acesso:", error);
    return { error: "Erro interno" };
  }
}

export async function setActivePoolAction(poolId: number) {
  const cookieStore = await cookies();
  cookieStore.set("active-pool-id", String(poolId), {
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 dias
  });
  
  revalidatePath("/");
  return { success: true };
}
