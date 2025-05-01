export async function up(knex) {
    await knex.schema.alterTable('admins', (table) => {
      table.enum('type', ['admin', 'vendor']).defaultTo('admin');
    });
  }
  
  export async function down(knex) {
    await knex.schema.alterTable('admins', (table) => {
      table.dropColumn('type');
    });
  }