"use server";

import db from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";

export async function saveGuess(matchId: number, guessA: number, guessB: number) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return { error: "Você precisa estar logado para palpitar." };
    }

    // Busca o user pelo email para pegar o id da nossa base Knex
    const user = await db("users").where({ email: session.user.email }).first();
    let userId = user?.id;

    if (!user) {
      // Se não existir, autocria o usuário no 1º palpite
      const [newUser] = await db("users").insert({
        name: session.user.name || session.user.email.split("@")[0],
        email: session.user.email,
        image: session.user.image || ""
      }).returning("id");
      
      userId = newUser?.id || newUser;
    }

    // Valida se o jogo existe
    const match = await db("matches").where({ id: matchId }).first();
    if (!match) {
      return { error: "Jogo não encontrado." };
    }

    // Valida se já começou
    if (new Date(match.date) < new Date()) {
      return { error: "Este jogo já passou do horário estipulado. Palpites encerrados!" };
    }

    // Verifica se já tem palpite
    const existingGuess = await db("guesses").where({ user_id: userId, match_id: matchId }).first();

    if (existingGuess) {
      await db("guesses").where({ id: existingGuess.id }).update({
        guess_a: guessA,
        guess_b: guessB,
        updated_at: db.fn.now()
      });
    } else {
      await db("guesses").insert({
        user_id: userId,
        match_id: matchId,
        guess_a: guessA,
        guess_b: guessB
      });
    }

    // Limpa o cache da home para refletir o dado preenchido
    revalidatePath("/");
    
    return { success: true, message: "Palpite salvo com sucesso!" };

  } catch (err) {
    console.error("Erro na server action saveGuess:", err);
    return { error: "Não foi possível salvar seu palpite no servidor." };
  }
}
