import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import vine, { SimpleMessagesProvider } from '@vinejs/vine'
import Product from '#models/product'
import Category from '#models/category'
import Option from '#models/option'
import { generateBaseSku, ensureUniqueSku } from '../../utils/sku_helper.js'
import { unlink } from 'node:fs/promises'

export default class ProductController {
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

        const query = Product.query().preload('category')

        if (search) {
            const searchPattern = `%${search}%`
            query.where((builder) => {
                builder
                    .where('name', 'like', searchPattern)
                    .orWhere('slug', 'like', searchPattern)
                    .orWhere('description', 'like', searchPattern)
            })
        }

        const products = await query
            .preload('options')
            .preload('optionValues')
            .orderBy('created_at', 'desc')
            .paginate(page, limit)
        const categories = await Category.all()

        let availableOptions: any[] = []
        if (categoryId) {
            availableOptions = await this.getCategoryOptions(categoryId)
        }

        return inertia.render('product/index', {
            products: products.serialize(),
            categories: categories.map((c) => c.serialize()),
            availableOptions: availableOptions.map((o) => ({
                id: o.id,
                name: o.name,
                values: o.values.map((v: any) => ({
                    id: v.id,
                    name: v.name,
                    price_adder: v.priceAdder,
                })),
            })),
        })
    }

    async store({ request, response, session }: HttpContext) {
        const uniqueSlugRule = vine.createRule(async (value: unknown, _: any, field: any) => {
            if (!value || typeof value !== 'string') {
                return
            }

            const existing = await Product.query().where('slug', value).first()
            if (existing) {
                field.report('The slug has already been taken', 'uniqueProductSlug', field)
            }
        })

        const data = await request.validateUsing(
            vine.compile(
                vine.object({
                    name: vine.string().minLength(1).maxLength(255),
                    slug: vine.string().maxLength(255).trim().use(uniqueSlugRule()),
                    sku: vine.string().maxLength(255).trim().optional(),
                    category_id: vine.number().exists({ table: 'categories', column: 'id' }),
                    description: vine.string().optional(),
                    base_price: vine.number().min(0),
                    option_ids: vine.array(vine.number()).optional(),
                    option_value_ids: vine.array(vine.number()).optional(),
                    image: vine
                        .file({
                            size: '10mb',
                            extnames: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
                        })
                        .optional(),
                })
            ),
            {
                messagesProvider: new SimpleMessagesProvider({
                    'required': 'The {{ field }} field is required.',
                    'category_id.required': 'The category field is required.',
                    'slug.uniqueProductSlug': 'The slug has already been taken.',
                }),
            }
        )

        if (data.option_ids && data.option_ids.length > 0) {
            const category = await Category.findOrFail(data.category_id)
            await category.load('options')

            const categoryOptionIds = category.options.map((o) => o.id)
            const invalidOptions = data.option_ids.filter((id) => !categoryOptionIds.includes(id))

            if (invalidOptions.length > 0) {
                session.flash('notification', {
                    type: 'error',
                    message: 'Some selected options do not belong to the selected category',
                })
                return response.redirect().back()
            }

            const selectedOptions = await Option.query()
                .whereIn('id', data.option_ids)
                .preload('values')

            for (const option of selectedOptions) {
                if (option.values.length > 0) {
                    const hasSelectedValue =
                        data.option_value_ids &&
                        data.option_value_ids.some((vid) => option.values.some((v) => v.id === vid))
                    if (!hasSelectedValue) {
                        session.flash('notification', {
                            type: 'error',
                            message: `Please select at least one value for "${option.name}" option`,
                        })
                        return response.redirect().back()
                    }
                }
            }

            if (data.option_value_ids && data.option_value_ids.length > 0) {
                const validOptionValueIds = selectedOptions
                    .flatMap((o) => o.values.map((v) => v.id))
                    .filter((id, index, self) => self.indexOf(id) === index)

                const invalidOptionValues = data.option_value_ids.filter(
                    (id) => !validOptionValueIds.includes(id)
                )

                if (invalidOptionValues.length > 0) {
                    session.flash('notification', {
                        type: 'error',
                        message:
                            'Some selected option values do not belong to the selected options',
                    })
                    return response.redirect().back()
                }
            }
        }

        let imagePath: string | null = null

        if (data.image) {
            const uploadsDir = app.publicPath('uploads/products')
            const fileName = `${data.slug}-${Date.now()}.${data.image.extname}`
            imagePath = `/uploads/products/${fileName}`

            try {
                await data.image.move(uploadsDir, { name: fileName })
            } catch (error) {
                session.flash('notification', {
                    type: 'error',
                    message: 'Failed to upload image',
                })
                return response.redirect().back()
            }
        }

        try {
            const category = await Category.findOrFail(data.category_id)
            const optionIds = data.option_ids || []

            const product = await Product.create({
                name: data.name,
                slug: data.slug,
                sku: null,
                categoryId: data.category_id,
                description: data.description || null,
                basePrice: data.base_price,
                image: imagePath,
            })

            let sku: string | null = null
            if (data.sku && data.sku.trim()) {
                sku = await ensureUniqueSku(data.sku.trim().toUpperCase(), product.id)
            } else {
                const baseSku = generateBaseSku(category.name, product.id, data.name)
                sku = await ensureUniqueSku(baseSku, product.id)
            }

            product.sku = sku
            await product.save()

            if (optionIds.length > 0) {
                await product.related('options').attach(optionIds)
            }

            if (data.option_value_ids && data.option_value_ids.length > 0) {
                await product.related('optionValues').attach(data.option_value_ids)
            }

            session.flash('notification', {
                type: 'success',
                message: 'Product created successfully',
            })

            return response.redirect().toRoute('products.show', { id: product.id })
        } catch (error) {
            if (imagePath) {
                try {
                    await unlink(app.publicPath(imagePath))
                } catch {}
            }
            session.flash('notification', {
                type: 'error',
                message: 'Failed to create product',
            })

            return response.redirect().back()
        }
    }

    async create({ inertia }: HttpContext) {
        const categories = await Category.all()
        return inertia.render('product/form', {
            categories: categories.map((c) => c.serialize()),
            availableOptions: [],
        })
    }

    async show({ params, inertia }: HttpContext) {
        const product = await Product.findOrFail(params.id)
        await product.load('category')
        await product.load('options', (query) => {
            query.preload('values')
        })
        await product.load('optionValues')

        const categories = await Category.all()
        let availableOptions: any[] = []
        if (product.categoryId) {
            availableOptions = await this.getCategoryOptions(product.categoryId)
        }

        return inertia.render('product/form', {
            product: {
                id: product.id,
                name: product.name,
                slug: product.slug,
                sku: product.sku,
                category_id: product.categoryId,
                description: product.description,
                base_price: product.basePrice,
                image: product.image,
                option_ids: product.options.map((o) => o.id),
                option_value_ids: product.optionValues.map((ov) => ov.id),
            },
            categories: categories.map((c) => c.serialize()),
            availableOptions: availableOptions.map((o) => ({
                id: o.id,
                name: o.name,
                values: o.values.map((v: any) => ({
                    id: v.id,
                    name: v.name,
                    price_adder: v.priceAdder,
                })),
            })),
        })
    }

    async update({ params, request, response, session }: HttpContext) {
        const product = await Product.findOrFail(params.id)

        const uniqueSlugRule = vine.createRule(async (value: unknown, _: any, field: any) => {
            if (!value || typeof value !== 'string') {
                return
            }

            const existing = await Product.query()
                .where('slug', value)
                .whereNot('id', product.id)
                .first()
            if (existing) {
                field.report('The slug has already been taken', 'uniqueProductSlug', field)
            }
        })

        const data = await request.validateUsing(
            vine.compile(
                vine.object({
                    name: vine.string().minLength(1).maxLength(255),
                    slug: vine.string().maxLength(255).trim().use(uniqueSlugRule()),
                    sku: vine.string().maxLength(255).trim().optional(),
                    category_id: vine.number().exists({ table: 'categories', column: 'id' }),
                    description: vine.string().optional(),
                    base_price: vine.number().min(0),
                    option_ids: vine.array(vine.number()).optional(),
                    option_value_ids: vine.array(vine.number()).optional(),
                    image: vine
                        .file({
                            size: '10mb',
                            extnames: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
                        })
                        .optional(),
                })
            ),
            {
                messagesProvider: new SimpleMessagesProvider({
                    'required': 'The {{ field }} field is required.',
                    'category_id.required': 'The category field is required.',
                    'slug.uniqueProductSlug': 'The slug has already been taken.',
                }),
            }
        )

        if (data.option_ids && data.option_ids.length > 0) {
            const category = await Category.findOrFail(data.category_id)
            await category.load('options')
            const categoryOptionIds = category.options.map((o) => o.id)
            const invalidOptions = data.option_ids.filter((id) => !categoryOptionIds.includes(id))
            if (invalidOptions.length > 0) {
                session.flash('notification', {
                    type: 'error',
                    message: 'Some selected options do not belong to the selected category',
                })
                return response.redirect().back()
            }

            const selectedOptions = await Option.query()
                .whereIn('id', data.option_ids)
                .preload('values')

            for (const option of selectedOptions) {
                if (option.values.length > 0) {
                    const hasSelectedValue =
                        data.option_value_ids &&
                        data.option_value_ids.some((vid) => option.values.some((v) => v.id === vid))
                    if (!hasSelectedValue) {
                        session.flash('notification', {
                            type: 'error',
                            message: `Please select at least one value for "${option.name}" option`,
                        })
                        return response.redirect().back()
                    }
                }
            }

            if (data.option_value_ids && data.option_value_ids.length > 0) {
                const validOptionValueIds = selectedOptions
                    .flatMap((o) => o.values.map((v) => v.id))
                    .filter((id, index, self) => self.indexOf(id) === index)
                const invalidOptionValues = data.option_value_ids.filter(
                    (id) => !validOptionValueIds.includes(id)
                )
                if (invalidOptionValues.length > 0) {
                    session.flash('notification', {
                        type: 'error',
                        message:
                            'Some selected option values do not belong to the selected options',
                    })
                    return response.redirect().back()
                }
            }
        }

        let imagePath: string | null = product.image

        if (data.image) {
            const uploadsDir = app.publicPath('uploads/products')
            const fileName = `${data.slug}-${Date.now()}.${data.image.extname}`
            imagePath = `/uploads/products/${fileName}`

            try {
                await data.image.move(uploadsDir, { name: fileName })

                if (product.image) {
                    try {
                        await unlink(app.publicPath(product.image))
                    } catch {}
                }
            } catch (error) {
                session.flash('notification', {
                    type: 'error',
                    message: 'Failed to upload image',
                })
                return response.redirect().back()
            }
        }

        try {
            const optionIds = data.option_ids || []
            const hasOptions = optionIds.length > 0
            const category = await Category.findOrFail(data.category_id)

            let sku = product.sku
            if (data.sku && data.sku.trim()) {
                sku = await ensureUniqueSku(data.sku.trim().toUpperCase(), product.id)
            } else if (!sku) {
                const baseSku = generateBaseSku(
                    category.name,
                    product.id,
                    data.name || product.name
                )
                sku = await ensureUniqueSku(baseSku, product.id)
            }

            product.merge({
                name: data.name || product.name,
                slug: data.slug || product.slug,
                sku,
                categoryId: data.category_id !== undefined ? data.category_id : product.categoryId,
                description:
                    data.description !== undefined ? data.description : product.description,
                basePrice: data.base_price !== undefined ? data.base_price : product.basePrice,
                image: imagePath,
            })

            await product.save()

            if (hasOptions) {
                await product.related('options').sync(optionIds)
            } else {
                await product.related('options').detach()
            }

            if (data.option_value_ids && data.option_value_ids.length > 0) {
                await product.related('optionValues').sync(data.option_value_ids)
            } else {
                await product.related('optionValues').detach()
            }

            session.flash('notification', {
                type: 'success',
                message: 'Product updated successfully',
            })

            return response.redirect().toRoute('products.show', { id: product.id })
        } catch (error) {
            if (data.image && imagePath) {
                try {
                    await unlink(app.publicPath(imagePath))
                } catch {}
            }
            session.flash('notification', {
                type: 'error',
                message: 'Failed to update product',
            })

            return response.redirect().back()
        }
    }

    async destroy({ params, response, session }: HttpContext) {
        try {
            const product = await Product.findOrFail(params.id)

            if (product.image) {
                try {
                    await unlink(app.publicPath(product.image))
                } catch {}
            }

            await product.delete()

            session.flash('notification', {
                type: 'success',
                message: 'Product deleted successfully',
            })

            return response.redirect().back()
        } catch (error) {
            session.flash('notification', {
                type: 'error',
                message: 'Failed to delete product',
            })

            return response.redirect().back()
        }
    }

    async getCategoryOptions(categoryId: number) {
        const category = await Category.findOrFail(categoryId)
        await category.load('options', (query) => {
            query.preload('values')
        })
        return category.options
    }

    async getOptions({ params, response }: HttpContext) {
        const { categoryId } = await vine
            .compile(
                vine.object({
                    categoryId: vine.number().exists({ table: 'categories', column: 'id' }),
                })
            )
            .validate(params)

        const options = await this.getCategoryOptions(categoryId)
        return response.ok(
            options.map((o) => ({
                id: o.id,
                name: o.name,
                values: o.values.map((v) => ({
                    id: v.id,
                    name: v.name,
                    price_adder: v.priceAdder,
                })),
            }))
        )
    }
}
