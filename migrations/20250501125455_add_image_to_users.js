export async function up(knex) {
    await knex.schema.alterTable('users', (table) => {
      table.string('image', 255).nullable().after('address');
      });
  }
  
  export async function down(knex) {
    await knex.schema.alterTable('users', (table) => {
      table.dropColumn('image');
      });
  }