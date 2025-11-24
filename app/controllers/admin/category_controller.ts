import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import vine from '@vinejs/vine'
import Category from '#models/category'
import { generateSlug, generateUniqueSlug } from '../../utils/slug_helper.js'
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
        const data = await request.validateUsing(
            vine.compile(
                vine.object({
                    name: vine.string().minLength(1).maxLength(255),
                    slug: vine.string().maxLength(255).trim().optional(),
                    description: vine.string().optional(),
                    image: vine
                        .file({
                            size: '10mb',
                            extnames: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
                        })
                        .optional(),
                })
            )
        )

        let slug = data.slug || generateSlug(data.name)

        const checkUnique = async (slugToCheck: string, excludeId?: number) => {
            const query = Category.query().where('slug', slugToCheck)
            if (excludeId) {
                query.whereNot('id', excludeId)
            }
            const exists = await query.first()
            return !!exists
        }

        slug = await generateUniqueSlug(slug, checkUnique)

        let imagePath: string | null = null

        if (data.image) {
            const uploadsDir = app.publicPath('uploads/categories')
            const fileName = `${slug}-${Date.now()}.${data.image.extname}`
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
                slug,
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

        const data = await request.validateUsing(
            vine.compile(
                vine.object({
                    name: vine.string().minLength(1).maxLength(255),
                    slug: vine.string().maxLength(255).trim().optional(),
                    description: vine.string().optional(),
                    image: vine
                        .file({
                            size: '10mb',
                            extnames: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
                        })
                        .optional(),
                })
            )
        )

        let slug = category.slug

        if (data.name && data.name !== category.name) {
            slug = data.slug || generateSlug(data.name)

            const checkUnique = async (slugToCheck: string, excludeId?: number) => {
                const query = Category.query().where('slug', slugToCheck)
                if (excludeId) {
                    query.whereNot('id', excludeId)
                }
                const exists = await query.first()
                return !!exists
            }

            slug = await generateUniqueSlug(slug, checkUnique, category.id)
        } else if (data.slug && data.slug !== category.slug) {
            const checkUnique = async (slugToCheck: string, excludeId?: number) => {
                const query = Category.query().where('slug', slugToCheck)
                if (excludeId) {
                    query.whereNot('id', excludeId)
                }
                const exists = await query.first()
                return !!exists
            }

            slug = await generateUniqueSlug(data.slug, checkUnique, category.id)
        }

        let imagePath: string | null = category.image

        if (data.image) {
            const uploadsDir = app.publicPath('uploads/categories')
            const fileName = `${slug}-${Date.now()}.${data.image.extname}`
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
                slug,
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
