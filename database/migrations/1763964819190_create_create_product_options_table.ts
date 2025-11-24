import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
    protected tableName = 'product_option'

    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id').notNullable()
            table
                .integer('product_id')
                .unsigned()
                .notNullable()
                .references('id')
                .inTable('products')
                .onDelete('CASCADE')
            table
                .integer('option_id')
                .unsigned()
                .notNullable()
                .references('id')
                .inTable('options')
                .onDelete('CASCADE')

            table.timestamps(true, true)

            table.unique(['product_id', 'option_id'])
            table.index('product_id')
            table.index('option_id')
        })
    }

    async down() {
        this.schema.dropTable(this.tableName)
    }
}
