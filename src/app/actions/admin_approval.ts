"use server";

import db from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";

export async function approveUserAction(userId: number, poolId: number) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.email !== process.env.ADMIN_EMAIL) {
    throw new Error("Não autorizado.");
  }

  try {
    await db.transaction(async (trx) => {
      // 1. Atualizar status do usuário para ativo
      await trx("users").where({ id: userId }).update({ status: "active" });

      // 2. Tenta encontrar se já existe uma membership pendente para este bolão
      const existing = await trx("pool_memberships").where({ user_id: userId, pool_id: poolId }).first();
      
      if (existing) {
        await trx("pool_memberships").where({ id: existing.id }).update({ status: "approved" });
      } else {
        // Criar membership no bolão selecionado
        await trx("pool_memberships").insert({
          user_id: userId,
          pool_id: poolId,
          status: "approved",
          role: "member"
        });
      }
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Erro na aprovação:", error);
    return { error: "Erro interno ao aprovar usuário." };
  }
}

export async function approveMembershipAction(membershipId: number) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.email !== process.env.ADMIN_EMAIL) {
    throw new Error("Não autorizado.");
  }

  try {
    const membership = await db("pool_memberships").where({ id: membershipId }).first();
    if (!membership) return { error: "Associação não encontrada." };

    await db.transaction(async (trx) => {
      // 1. Aprovar associação
      await trx("pool_memberships").where({ id: membershipId }).update({ status: "approved" });

      // 2. Garantir que o usuário está ativo no sistema
      await trx("users").where({ id: membership.user_id }).update({ status: "active" });
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Erro ao aprovar associação:", error);
    return { error: "Erro interno." };
  }
}

export async function rejectMembershipAction(membershipId: number) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.email !== process.env.ADMIN_EMAIL) {
    throw new Error("Não autorizado.");
  }

  try {
    await db("pool_memberships").where({ id: membershipId }).delete();
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Erro ao rejeitar associação:", error);
    return { error: "Erro interno." };
  }
}
