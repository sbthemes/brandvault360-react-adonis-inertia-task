import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
    protected tableName = 'products'

    async up() {
        this.schema.alterTable(this.tableName, (table) => {
            table.string('sku').nullable().unique()
            table.index('sku')
        })
    }

    async down() {
        this.schema.alterTable(this.tableName, (table) => {
            table.dropColumn('sku')
        })
    }
}
