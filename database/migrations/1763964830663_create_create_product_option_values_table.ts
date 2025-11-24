import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
    protected tableName = 'product_option_value'

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
                .integer('option_value_id')
                .unsigned()
                .notNullable()
                .references('id')
                .inTable('option_values')
                .onDelete('CASCADE')

            table.timestamps(true, true)

            table.unique(['product_id', 'option_value_id'])
            table.index('product_id')
            table.index('option_value_id')
        })
    }

    async down() {
        this.schema.dropTable(this.tableName)
    }
}
