"use server";

import db from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";

export async function toggleAdminRoleAction(userId: number) {
  const session = await getServerSession(authOptions);

  // Apenas admins podem promover outros admins
  if (!session || (session.user as any).role !== "admin") {
    throw new Error("Não autorizado.");
  }

  try {
    const user = await db("users").where({ id: userId }).first();
    if (!user) {
      return { error: "Usuário não encontrado." };
    }

    // Não permitir que o dono do ADMIN_EMAIL seja removido do cargo de admin via UI
    // Isso evita que o dono se bloqueie fora do sistema acidentalmente
    if (user.email === process.env.ADMIN_EMAIL && user.role === "admin") {
       return { error: "O Administrador Principal não pode ser removido através da interface." };
    }

    const newRole = user.role === "admin" ? "user" : "admin";
    await db("users").where({ id: userId }).update({ role: newRole });

    revalidatePath("/admin");
    return { success: true, newRole };
  } catch (error) {
    console.error("Erro ao alterar papel:", error);
    return { error: "Erro interno ao alterar papel do usuário." };
  }
}
