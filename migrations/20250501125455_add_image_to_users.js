export async function up(knex) {
    await knex.schema.alterTable('users', (table) => {
      table.binary('image').nullable().after('address');
      });
  }
  
  export async function down(knex) {
    await knex.schema.alterTable('users', (table) => {
      table.dropColumn('image');
      });
  }