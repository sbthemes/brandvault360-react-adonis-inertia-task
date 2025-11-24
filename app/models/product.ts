import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Category from './category.js'

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
}
