import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
    protected tableName = 'option_values'

    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id').notNullable()
            table
                .integer('option_id')
                .unsigned()
                .notNullable()
                .references('id')
                .inTable('options')
                .onDelete('CASCADE')
            table.string('name').notNullable()
            table.decimal('price_adder', 10, 2).notNullable().defaultTo(0)

            table.timestamps(true, true)

            table.unique(['option_id', 'name'])
            table.index('option_id')
        })
    }

    async down() {
        this.schema.dropTable(this.tableName)
    }
}
