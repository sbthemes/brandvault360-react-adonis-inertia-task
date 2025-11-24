import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import type { HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import OptionValue from './option_value.js'
import Category from './category.js'

export default class Option extends BaseModel {
    @column({ isPrimary: true })
    declare id: number

    @column()
    declare name: string

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime | null

    @hasMany(() => OptionValue)
    declare values: HasMany<typeof OptionValue>

    @manyToMany(() => Category, {
        pivotTable: 'category_option',
        pivotForeignKey: 'option_id',
        pivotRelatedForeignKey: 'category_id',
    })
    declare categories: ManyToMany<typeof Category>
}
