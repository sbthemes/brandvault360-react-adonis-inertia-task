import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import vine, { SimpleMessagesProvider } from '@vinejs/vine'
import Category from '#models/category'
import { unlink } from 'node:fs/promises'

export default class CategoryController {
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

        const query = Category.query()

        if (search) {
            const searchPattern = `%${search}%`
            query.where((builder) => {
                builder
                    .where('name', 'like', searchPattern)
                    .orWhere('slug', 'like', searchPattern)
                    .orWhere('description', 'like', searchPattern)
            })
        }

        const categories = await query.orderBy('created_at', 'desc').paginate(page, limit)

        return inertia.render('category/index', {
            categories: categories.serialize(),
        })
    }

    async store({ request, response, session }: HttpContext) {
        const uniqueSlugRule = vine.createRule(async (value: unknown, _: any, field: any) => {
            if (!value || typeof value !== 'string') {
                return
            }

            const existing = await Category.query().where('slug', value).first()
            if (existing) {
                field.report('The slug has already been taken', 'uniqueCategorySlug', field)
            }
        })

        const data = await request.validateUsing(
            vine.compile(
                vine.object({
                    name: vine.string().minLength(1).maxLength(255),
                    slug: vine.string().maxLength(255).trim().use(uniqueSlugRule()),
                    description: vine.string().optional(),
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
                    'slug.uniqueCategorySlug': 'The slug has already been taken.',
                }),
            }
        )

        let imagePath: string | null = null

        if (data.image) {
            const uploadsDir = app.publicPath('uploads/categories')
            const fileName = `${data.slug}-${Date.now()}.${data.image.extname}`
            imagePath = `/uploads/categories/${fileName}`

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
            await Category.create({
                name: data.name,
                slug: data.slug,
                description: data.description || null,
                image: imagePath,
            })

            session.flash('notification', {
                type: 'success',
                message: 'Category created successfully',
            })

            return response.redirect().back()
        } catch (error) {
            if (imagePath) {
                try {
                    await unlink(app.publicPath(imagePath))
                } catch {
                    // Ignore cleanup errors
                }
            }
            session.flash('notification', {
                type: 'error',
                message: 'Failed to create category',
            })

            return response.redirect().back()
        }
    }

    async show({ params, inertia }: HttpContext) {
        const category = await Category.findOrFail(params.id)

        return inertia.render('category/index', {
            category: category.serialize(),
        })
    }

    async update({ params, request, response, session }: HttpContext) {
        const category = await Category.findOrFail(params.id)

        const uniqueSlugRule = vine.createRule(async (value: unknown, _: any, field: any) => {
            if (!value || typeof value !== 'string') {
                return
            }

            const existing = await Category.query()
                .where('slug', value)
                .whereNot('id', category.id)
                .first()
            if (existing) {
                field.report('The slug has already been taken', 'uniqueCategorySlug', field)
            }
        })

        const data = await request.validateUsing(
            vine.compile(
                vine.object({
                    name: vine.string().minLength(1).maxLength(255),
                    slug: vine.string().maxLength(255).trim().use(uniqueSlugRule()),
                    description: vine.string().optional(),
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
                    'slug.uniqueCategorySlug': 'The slug has already been taken.',
                }),
            }
        )

        let imagePath: string | null = category.image

        if (data.image) {
            const uploadsDir = app.publicPath('uploads/categories')
            const fileName = `${data.slug}-${Date.now()}.${data.image.extname}`
            imagePath = `/uploads/categories/${fileName}`

            try {
                await data.image.move(uploadsDir, { name: fileName })

                if (category.image) {
                    try {
                        await unlink(app.publicPath(category.image))
                    } catch {
                        // Ignore cleanup errors
                    }
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
            category.merge({
                name: data.name || category.name,
                slug: data.slug || category.slug,
                description:
                    data.description !== undefined ? data.description : category.description,
                image: imagePath,
            })

            await category.save()

            session.flash('notification', {
                type: 'success',
                message: 'Category updated successfully',
            })

            return response.redirect().back()
        } catch (error) {
            if (data.image && imagePath) {
                try {
                    await unlink(app.publicPath(imagePath))
                } catch {
                    // Ignore cleanup errors
                }
            }
            session.flash('notification', {
                type: 'error',
                message: 'Failed to update category',
            })

            return response.redirect().back()
        }
    }

    async destroy({ params, response, session }: HttpContext) {
        try {
            const category = await Category.findOrFail(params.id)

            if (category.image) {
                try {
                    await unlink(app.publicPath(category.image))
                } catch {
                    // Ignore cleanup errors
                }
            }

            await category.delete()

            session.flash('notification', {
                type: 'success',
                message: 'Category deleted successfully',
            })

            return response.redirect().back()
        } catch (error) {
            session.flash('notification', {
                type: 'error',
                message: 'Failed to delete category',
            })

            return response.redirect().back()
        }
    }
}
