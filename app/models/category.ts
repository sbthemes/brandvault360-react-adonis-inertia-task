import { DateTime } from 'luxon'
import { BaseModel, column, manyToMany } from '@adonisjs/lucid/orm'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import Option from './option.js'

export default class Category extends BaseModel {
    @column({ isPrimary: true })
    declare id: number

    @column()
    declare name: string

    @column()
    declare slug: string

    @column()
    declare description: string | null

    @column()
    declare image: string | null

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime | null

    @manyToMany(() => Option, {
        pivotTable: 'category_option',
        pivotForeignKey: 'category_id',
        pivotRelatedForeignKey: 'option_id',
    })
    declare options: ManyToMany<typeof Option>
}
