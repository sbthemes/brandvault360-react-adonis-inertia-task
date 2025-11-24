import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import vine, { SimpleMessagesProvider } from '@vinejs/vine'
import Product from '#models/product'
import Category from '#models/category'
import { generateSlug, generateUniqueSlug } from '../../utils/slug_helper.js'
import { unlink } from 'node:fs/promises'

export default class ProductController {
    async index({ request, inertia }: HttpContext) {
        const {
            page = 1,
            limit = 15,
            search = '',
        } = await request.validateUsing(
            vine.compile(
                vine.object({
                    page: vine.number().min(1).optional(),
                    limit: vine.number().min(1).max(100).optional(),
                    search: vine.string().trim().maxLength(255).optional(),
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

        const products = await query.orderBy('created_at', 'desc').paginate(page, limit)
        const categories = await Category.all()

        return inertia.render('product/index', {
            products: products.serialize(),
            categories: categories.map((c) => c.serialize()),
        })
    }

    async store({ request, response, session }: HttpContext) {
        const data = await request.validateUsing(
            vine.compile(
                vine.object({
                    name: vine.string().minLength(1).maxLength(255),
                    slug: vine.string().maxLength(255).trim().optional(),
                    category_id: vine.number().exists({ table: 'categories', column: 'id' }),
                    description: vine.string().optional(),
                    base_price: vine.number().min(0),
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
                }),
            }
        )

        let slug = data.slug || generateSlug(data.name)

        const checkUnique = async (slugToCheck: string, excludeId?: number) => {
            const query = Product.query().where('slug', slugToCheck)
            if (excludeId) {
                query.whereNot('id', excludeId)
            }
            const exists = await query.first()
            return !!exists
        }

        slug = await generateUniqueSlug(slug, checkUnique)

        let imagePath: string | null = null

        if (data.image) {
            const uploadsDir = app.publicPath('uploads/products')
            const fileName = `${slug}-${Date.now()}.${data.image.extname}`
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
            await Product.create({
                name: data.name,
                slug,
                categoryId: data.category_id,
                description: data.description || null,
                basePrice: data.base_price,
                image: imagePath,
            })

            session.flash('notification', {
                type: 'success',
                message: 'Product created successfully',
            })

            return response.redirect().back()
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

    async show({ params, inertia }: HttpContext) {
        const product = await Product.findOrFail(params.id)
        await product.load('category')

        return inertia.render('product/index', {
            product: product.serialize(),
        })
    }

    async update({ params, request, response, session }: HttpContext) {
        const product = await Product.findOrFail(params.id)

        const data = await request.validateUsing(
            vine.compile(
                vine.object({
                    name: vine.string().minLength(1).maxLength(255),
                    slug: vine.string().maxLength(255).trim().optional(),
                    category_id: vine.number().exists({ table: 'categories', column: 'id' }),
                    description: vine.string().optional(),
                    base_price: vine.number().min(0),
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
                }),
            }
        )

        let slug = product.slug

        if (data.name && data.name !== product.name) {
            slug = data.slug || generateSlug(data.name)

            const checkUnique = async (slugToCheck: string, excludeId?: number) => {
                const query = Product.query().where('slug', slugToCheck)
                if (excludeId) {
                    query.whereNot('id', excludeId)
                }
                const exists = await query.first()
                return !!exists
            }

            slug = await generateUniqueSlug(slug, checkUnique, product.id)
        } else if (data.slug && data.slug !== product.slug) {
            const checkUnique = async (slugToCheck: string, excludeId?: number) => {
                const query = Product.query().where('slug', slugToCheck)
                if (excludeId) {
                    query.whereNot('id', excludeId)
                }
                const exists = await query.first()
                return !!exists
            }

            slug = await generateUniqueSlug(data.slug, checkUnique, product.id)
        }

        let imagePath: string | null = product.image

        if (data.image) {
            const uploadsDir = app.publicPath('uploads/products')
            const fileName = `${slug}-${Date.now()}.${data.image.extname}`
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
            product.merge({
                name: data.name || product.name,
                slug,
                categoryId: data.category_id !== undefined ? data.category_id : product.categoryId,
                description:
                    data.description !== undefined ? data.description : product.description,
                basePrice: data.base_price !== undefined ? data.base_price : product.basePrice,
                image: imagePath,
            })

            await product.save()

            session.flash('notification', {
                type: 'success',
                message: 'Product updated successfully',
            })

            return response.redirect().back()
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
}
