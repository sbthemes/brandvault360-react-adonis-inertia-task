import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
    protected tableName = 'products'

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
            table.string('name').notNullable()
            table.string('slug').notNullable().unique()
            table.text('description').nullable()
            table.decimal('base_price', 10, 2).notNullable()
            table.string('image').nullable()

            table.timestamp('created_at').notNullable()
            table.timestamp('updated_at').nullable()
        })
    }

    async down() {
        this.schema.dropTable(this.tableName)
    }
}
