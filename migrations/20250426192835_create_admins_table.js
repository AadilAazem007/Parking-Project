
export async function up(knex) {
    await knex.schema.createTable('admins', (table) => {
      table.bigIncrements('id').primary();
      table.string('name', 255).notNullable();
      table.string('username', 255).notNullable().unique();
      table.string('email', 255).notNullable().unique();
      table.string('password', 255).notNullable();
      table.string('mobile', 20).notNullable().unique();
      table.string('city', 50).notNullable();
      table.text('address').nullable();
      table.timestamps(true, true); // created_at, updated_at
    });
  }

export async function down(knex) {
    await knex.schema.dropTable('admins');
  }