import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Option from './option.js'

export default class OptionValue extends BaseModel {
    @column({ isPrimary: true })
    declare id: number

    @column({ columnName: 'option_id' })
    declare optionId: number

    @column()
    declare name: string

    @column()
    declare priceAdder: number

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime | null

    @belongsTo(() => Option)
    declare option: BelongsTo<typeof Option>
}
