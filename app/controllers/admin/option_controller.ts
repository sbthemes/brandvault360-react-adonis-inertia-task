import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'
import Option from '#models/option'
import OptionValue from '#models/option_value'
import Category from '#models/category'

const uniqueValueNames = vine.createRule((value, _, field) => {
    if (!Array.isArray(value)) {
        return
    }

    const names = value.map((item: any) => item?.name).filter(Boolean)
    const uniqueNames = new Set(names)

    if (names.length !== uniqueNames.size) {
        field.report('Duplicate value names are not allowed', 'uniqueValueNames', field)
    }
})

export default class OptionController {
    async index({ request, inertia }: HttpContext) {
        const {
            page = 1,
            limit = 15,
            search = '',
            category_id: categoryId,
        } = await request.validateUsing(
            vine.compile(
                vine.object({
                    page: vine.number().min(1).optional(),
                    limit: vine.number().min(1).max(100).optional(),
                    search: vine.string().trim().maxLength(255).optional(),
                    category_id: vine.number().optional(),
                })
            )
        )

        const query = Option.query().preload('values').preload('categories')

        if (search) {
            const searchPattern = `%${search}%`
            query.where('name', 'like', searchPattern)
        }

        if (categoryId) {
            query.whereExists((subquery) => {
                subquery
                    .from('category_option')
                    .whereRaw('category_option.option_id = options.id')
                    .where('category_option.category_id', categoryId)
            })
        }

        const options = await query.orderBy('created_at', 'desc').paginate(page, limit)
        const categories = await Category.all()

        return inertia.render('option/index', {
            options: options.serialize(),
            categories: categories.map((c) => c.serialize()),
        })
    }

    async store({ request, response, session }: HttpContext) {
        const data = await request.validateUsing(
            vine.compile(
                vine.object({
                    name: vine.string().minLength(1).maxLength(255),
                    category_ids: vine.array(vine.number()).optional(),
                    values: vine
                        .array(
                            vine.object({
                                name: vine.string().minLength(1).maxLength(255),
                                price_adder: vine.number().optional(),
                            })
                        )
                        .use(uniqueValueNames())
                        .optional(),
                })
            )
        )

        try {
            const option = await Option.create({
                name: data.name,
            })

            if (data.category_ids && data.category_ids.length > 0) {
                await option.related('categories').attach(data.category_ids)
            }

            if (data.values && data.values.length > 0) {
                await OptionValue.createMany(
                    data.values.map((value) => ({
                        optionId: option.id,
                        name: value.name,
                        priceAdder: value.price_adder || 0,
                    }))
                )
            }

            session.flash('notification', {
                type: 'success',
                message: 'Option created successfully',
            })

            return response.redirect().back()
        } catch (error) {
            session.flash('notification', {
                type: 'error',
                message: 'Failed to create option',
            })

            return response.redirect().back()
        }
    }

    async show({ params, inertia }: HttpContext) {
        const option = await Option.findOrFail(params.id)
        await option.load('values')
        await option.load('categories')

        return inertia.render('option/index', {
            option: option.serialize(),
        })
    }

    async update({ params, request, response, session }: HttpContext) {
        const option = await Option.findOrFail(params.id)

        const data = await request.validateUsing(
            vine.compile(
                vine.object({
                    name: vine.string().minLength(1).maxLength(255),
                    category_ids: vine.array(vine.number()).optional(),
                    values: vine
                        .array(
                            vine.object({
                                id: vine.number().optional(),
                                name: vine.string().minLength(1).maxLength(255),
                                price_adder: vine.number().optional(),
                            })
                        )
                        .use(uniqueValueNames())
                        .optional(),
                })
            )
        )

        try {
            option.merge({
                name: data.name,
            })
            await option.save()

            if (data.category_ids !== undefined) {
                await option.related('categories').sync(data.category_ids)
            }

            if (data.values !== undefined) {
                const existingValues = await OptionValue.query()
                    .where('option_id', option.id)
                    .exec()

                const incomingValueIds = new Set(
                    data.values.filter((v) => v.id).map((v) => v.id!.toString())
                )

                const valuesToDelete = existingValues.filter(
                    (v) => !incomingValueIds.has(v.id.toString())
                )
                await Promise.all(valuesToDelete.map((v) => v.delete()))

                for (const valueData of data.values) {
                    if (valueData.id) {
                        const existingValue = await OptionValue.find(valueData.id)
                        if (existingValue && existingValue.optionId === option.id) {
                            existingValue.merge({
                                name: valueData.name,
                                priceAdder: valueData.price_adder || 0,
                            })
                            await existingValue.save()
                        }
                    } else {
                        await OptionValue.create({
                            optionId: option.id,
                            name: valueData.name,
                            priceAdder: valueData.price_adder || 0,
                        })
                    }
                }
            }

            session.flash('notification', {
                type: 'success',
                message: 'Option updated successfully',
            })

            return response.redirect().back()
        } catch (error) {
            session.flash('notification', {
                type: 'error',
                message: 'Failed to update option',
            })

            return response.redirect().back()
        }
    }

    async destroy({ params, response, session }: HttpContext) {
        try {
            const option = await Option.findOrFail(params.id)
            await option.delete()

            session.flash('notification', {
                type: 'success',
                message: 'Option deleted successfully',
            })

            return response.redirect().back()
        } catch (error) {
            session.flash('notification', {
                type: 'error',
                message: 'Failed to delete option',
            })

            return response.redirect().back()
        }
    }
}
