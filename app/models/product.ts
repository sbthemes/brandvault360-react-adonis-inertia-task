import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, ExtractModelRelations, ManyToMany } from '@adonisjs/lucid/types/relations'
import Category from './category.js'
import Option from './option.js'
import OptionValue from './option_value.js'

export default class Product extends BaseModel {
    @column({ isPrimary: true })
    declare id: number

    @column({ columnName: 'category_id' })
    declare categoryId: number

    @column()
    declare name: string

    @column()
    declare slug: string

    @column()
    declare sku: string | null

    @column()
    declare description: string | null

    @column()
    declare basePrice: number

    @column()
    declare image: string | null

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime | null

    @belongsTo(() => Category)
    declare category: BelongsTo<typeof Category>

    @manyToMany(() => Option, {
        pivotTable: 'product_option',
        pivotForeignKey: 'product_id',
        pivotRelatedForeignKey: 'option_id',
    })
    declare options: ManyToMany<typeof Option>

    @manyToMany(() => OptionValue, {
        pivotTable: 'product_option_value',
        pivotForeignKey: 'product_id',
        pivotRelatedForeignKey: 'option_value_id',
    })
    declare optionValues: ManyToMany<typeof OptionValue>

    async hasOptions(): Promise<boolean> {
        await this.load('options' as ExtractModelRelations<this>)
        return this.options.length > 0
    }
}
