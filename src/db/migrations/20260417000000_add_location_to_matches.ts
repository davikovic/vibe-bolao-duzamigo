import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("matches", (table) => {
    table.string("location");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("matches", (table) => {
    table.dropColumn("location");
  });
}
