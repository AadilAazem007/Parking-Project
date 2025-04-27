export async function up(knex) {
    await knex.schema.alterTable('users', (table) => {
      table.string('OTP', 8).nullable();
      table.boolean('is_active').notNullable().defaultTo(true);
    });
  }
  
  export async function down(knex) {
    await knex.schema.alterTable('users', (table) => {
      table.dropColumn('OTP');
      table.dropColumn('is_active');
    });
  }