"use server";

import db from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";

/** Retorna os pools onde o usuário autenticado é moderador. */
export async function getModeratedPools() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return [];

  const user = await db("users").where({ email: session.user.email }).first();
  if (!user) return [];

  return db("pools")
    .join("pool_memberships", "pools.id", "pool_memberships.pool_id")
    .where({
      "pool_memberships.user_id": user.id,
      "pool_memberships.role": "moderator",
      "pool_memberships.status": "approved",
    })
    .select("pools.id", "pools.name", "pools.description");
}

/** Retorna solicitações pendentes de um bolão específico. Acesso: admin global ou moderador daquele pool. */
export async function getPoolPendingMemberships(poolId: number) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { error: "Não autorizado", data: [] };

  const user = await db("users").where({ email: session.user.email }).first();
  if (!user) return { error: "Usuário não encontrado", data: [] };

  // Verificar se é admin global ou moderador deste pool
  const isGlobalAdmin = user.role === "admin";
  if (!isGlobalAdmin) {
    const membership = await db("pool_memberships").where({
      user_id: user.id,
      pool_id: poolId,
      role: "moderator",
      status: "approved",
    }).first();
    if (!membership) return { error: "Sem permissão para este bolão", data: [] };
  }

  const data = await db("pool_memberships")
    .join("users", "pool_memberships.user_id", "users.id")
    .where({ "pool_memberships.pool_id": poolId, "pool_memberships.status": "pending" })
    .select(
      "pool_memberships.id as membershipId",
      "users.id as userId",
      "users.name",
      "users.email",
      "users.image"
    );

  return { data };
}

/** Retorna membros aprovados de um pool (para o admin listar e promover). */
export async function getPoolApprovedMembers(poolId: number) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return [];

  // Só admin global acessa esta função
  const user = await db("users").where({ email: session.user.email }).first();
  if (!user || user.role !== "admin") return [];

  return db("pool_memberships")
    .join("users", "pool_memberships.user_id", "users.id")
    .where({ "pool_memberships.pool_id": poolId, "pool_memberships.status": "approved" })
    .whereNot({ "users.email": process.env.ADMIN_EMAIL })
    .select(
      "pool_memberships.id as membershipId",
      "pool_memberships.role as memberRole",
      "users.id as userId",
      "users.name",
      "users.email",
      "users.image"
    );
}

/** Moderador aprova uma solicitação pendente no seu bolão. */
export async function approveAsModerator(membershipId: number, poolId: number) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { error: "Não autorizado" };

  const user = await db("users").where({ email: session.user.email }).first();
  if (!user) return { error: "Usuário não encontrado" };

  // Verificar autorização
  const isGlobalAdmin = user.role === "admin";
  if (!isGlobalAdmin) {
    const modMembership = await db("pool_memberships").where({
      user_id: user.id,
      pool_id: poolId,
      role: "moderator",
      status: "approved",
    }).first();
    if (!modMembership) return { error: "Sem permissão para este bolão" };
  }

  // Verificar que a solicitação pertence ao pool correto
  const target = await db("pool_memberships").where({ id: membershipId, pool_id: poolId, status: "pending" }).first();
  if (!target) return { error: "Solicitação não encontrada ou já processada" };

  try {
    await db.transaction(async (trx) => {
      await trx("pool_memberships").where({ id: membershipId }).update({ status: "approved" });
      // Garantir que o usuário esteja ativo no sistema
      await trx("users").where({ id: target.user_id }).update({ status: "active" });
    });

    revalidatePath(`/pools/${poolId}/manage`);
    return { success: true };
  } catch (error) {
    console.error("Erro ao aprovar como moderador:", error);
    return { error: "Erro interno" };
  }
}

/** Moderador rejeita uma solicitação pendente no seu bolão. */
export async function rejectAsModerator(membershipId: number, poolId: number) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { error: "Não autorizado" };

  const user = await db("users").where({ email: session.user.email }).first();
  if (!user) return { error: "Usuário não encontrado" };

  const isGlobalAdmin = user.role === "admin";
  if (!isGlobalAdmin) {
    const modMembership = await db("pool_memberships").where({
      user_id: user.id,
      pool_id: poolId,
      role: "moderator",
      status: "approved",
    }).first();
    if (!modMembership) return { error: "Sem permissão para este bolão" };
  }

  const target = await db("pool_memberships").where({ id: membershipId, pool_id: poolId, status: "pending" }).first();
  if (!target) return { error: "Solicitação não encontrada ou já processada" };

  try {
    await db("pool_memberships").where({ id: membershipId }).delete();
    revalidatePath(`/pools/${poolId}/manage`);
    return { success: true };
  } catch (error) {
    console.error("Erro ao rejeitar como moderador:", error);
    return { error: "Erro interno" };
  }
}

/** Admin Global promove/rebaixa um membro a moderador em um pool específico. */
export async function toggleModeratorAction(membershipId: number, poolId: number) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return { error: "Apenas o Administrador Global pode promover moderadores." };
  }

  try {
    const membership = await db("pool_memberships").where({ id: membershipId, pool_id: poolId }).first();
    if (!membership) return { error: "Membro não encontrado neste bolão." };

    const newRole = membership.role === "moderator" ? "member" : "moderator";
    await db("pool_memberships").where({ id: membershipId }).update({ role: newRole });

    revalidatePath("/admin");
    return { success: true, newRole };
  } catch (error) {
    console.error("Erro ao alterar moderador:", error);
    return { error: "Erro interno." };
  }
}

/** Remove um membro aprovado do bolão (Acesso: Admin ou Moderador). */
export async function removeMemberAction(membershipId: number, poolId: number) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { error: "Não autorizado" };

  const user = await db("users").where({ email: session.user.email }).first();
  if (!user) return { error: "Usuário não encontrado" };

  const isGlobalAdmin = user.role === "admin";
  if (!isGlobalAdmin) {
    const modMembership = await db("pool_memberships").where({
      user_id: user.id,
      pool_id: poolId,
      role: "moderator",
      status: "approved",
    }).first();
    if (!modMembership) return { error: "Sem permissão para remover membros" };
  }

  try {
    await db("pool_memberships").where({ id: membershipId, pool_id: poolId }).delete();
    revalidatePath(`/pools/${poolId}/manage`);
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Erro ao remover membro:", error);
    return { error: "Erro interno" };
  }
}
