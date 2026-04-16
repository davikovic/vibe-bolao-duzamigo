"use server";

import db from "@/lib/db";
import bcrypt from "bcrypt";

export async function registerUser(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!name || !email || !password || !confirmPassword) {
    return { error: "Todos os campos são obrigatórios." };
  }

  if (password !== confirmPassword) {
    return { error: "As senhas não coincidem." };
  }

  if (password.length < 6) {
    return { error: "A senha deve ter pelo menos 6 caracteres." };
  }

  try {
    // Verificar se usuário já existe
    const existingUser = await db("users").where({ email }).first();
    if (existingUser) {
      if (existingUser.password) {
        return { error: "Este e-mail já está cadastrado." };
      } else {
        // Usuário logou via social no passado, mas quer criar senha agora
        const hashedPassword = await bcrypt.hash(password, 10);
        await db("users").where({ email }).update({
          password: hashedPassword,
          name: name, // Atualiza nome se desejar
          updated_at: db.fn.now(),
        });
        return { success: true, message: "Senha adicionada à sua conta social!" };
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db("users").insert({
      name,
      email,
      password: hashedPassword,
    });

    return { success: true, message: "Usuário cadastrado com sucesso!" };
  } catch (error) {
    console.error("Erro no registro:", error);
    return { error: "Houve um erro interno ao realizar o cadastro." };
  }
}
