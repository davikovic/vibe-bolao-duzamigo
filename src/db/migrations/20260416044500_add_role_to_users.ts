import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // 1. Adicionar coluna role na tabela users
  await knex.schema.alterTable("users", (table) => {
    table.string("role").defaultTo("user");
  });

  // 2. Definir o Administrador Global baseado na variável de ambiente
  if (process.env.ADMIN_EMAIL) {
    await knex("users")
      .where({ email: process.env.ADMIN_EMAIL })
      .update({ role: "admin", status: "active" });
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("users", (table) => {
    table.dropColumn("role");
  });
}
