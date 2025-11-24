import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
    protected tableName = 'category_option'

    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id').notNullable()
            table
                .integer('category_id')
                .unsigned()
                .notNullable()
                .references('id')
                .inTable('categories')
                .onDelete('CASCADE')
            table
                .integer('option_id')
                .unsigned()
                .notNullable()
                .references('id')
                .inTable('options')
                .onDelete('CASCADE')

            table.timestamps(true, true)

            table.unique(['category_id', 'option_id'])
            table.index('category_id')
            table.index('option_id')
        })
    }

    async down() {
        this.schema.dropTable(this.tableName)
    }
}
