import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'
import Category from '#models/category'
import Product from '#models/product'
import { generateVariantSku, generateOptionValueSku } from '../../utils/sku_helper.js'
import OptionValue from '#models/option_value'
import Option from '#models/option'

export default class ConfiguratorController {
    async getCategories(): Promise<Category[]> {
        const categories = await Category.query().orderBy('name', 'asc')

        return categories
    }

    async getProductsByCategory({ params, response }: HttpContext) {
        const {
            categoryId,
            page = 1,
            limit = 15,
        } = await vine
            .compile(
                vine.object({
                    categoryId: vine.number(),
                    page: vine.number().min(1).optional(),
                    limit: vine.number().min(1).max(100).optional(),
                })
            )
            .validate(params)

        const category = await Category.find(categoryId)
        if (!category) {
            return response.notFound({
                message: 'Category not found',
            })
        }

        const products = await Product.query()
            .where('category_id', categoryId)
            .preload('category')
            .preload('options', (query) => {
                query.preload('values')
            })
            .preload('optionValues')
            .orderBy('name', 'asc')
            .paginate(page, limit)

        const productsData = []
        for (const product of products) {
            const productOptionValueIds = product.optionValues.map((ov) => ov.id)
            const optionsData = product.options.map((option: Option) => ({
                id: option.id,
                name: option.name,
                values: option.values
                    .filter((value: OptionValue) => productOptionValueIds.includes(value.id))
                    .map((value: OptionValue) => ({
                        id: value.id,
                        name: value.name,
                        price: Number(product.basePrice) + Number(value.priceAdder),
                        price_adder: Number(value.priceAdder),
                    })),
            }))

            productsData.push({
                id: product.id,
                name: product.name,
                slug: product.slug,
                sku: product.sku,
                price: Number(product.basePrice),
                description: product.description,
                image: product.image,
                category: {
                    id: product.category.id,
                    name: product.category.name,
                },
                options: optionsData,
            })
        }

        return {
            category,
            products: {
                data: productsData,
                meta: products.serialize().meta,
            },
        }
    }

    async configure({ request, response }: HttpContext) {
        const data = await request.validateUsing(
            vine.compile(
                vine.object({
                    product_id: vine.number(),
                    option_value_ids: vine.array(vine.number()).optional(),
                })
            )
        )

        const product = await Product.find(data.product_id)
        if (!product) {
            return response.notFound({
                message: 'Product not found',
            })
        }
        await product.load('category')
        await product.load('options', (query) => {
            query.preload('values')
        })
        await product.load('optionValues')

        if (!product.sku) {
            return response.badRequest({
                message: 'Product does not have a base SKU',
            })
        }

        let selectedOptionValues: any[] = []
        let totalPrice = Number(product.basePrice)

        if (data.option_value_ids && data.option_value_ids.length > 0) {
            const optionValueIds = data.option_value_ids
            const validOptionValueIds = product.optionValues.map((ov) => ov.id)
            const invalidOptionValues = optionValueIds.filter(
                (id) => !validOptionValueIds.includes(id)
            )

            if (invalidOptionValues.length > 0) {
                return response.badRequest({
                    message: 'Some selected option values are not valid for this product',
                    invalid_option_value_ids: invalidOptionValues,
                })
            }

            selectedOptionValues = product.optionValues.filter((ov) =>
                optionValueIds.includes(ov.id)
            )

            const optionIds = new Set<number>()
            const duplicateOptions: number[] = []

            for (const ov of selectedOptionValues) {
                const option = product.options.find((o) => o.values.some((v) => v.id === ov.id))
                if (option) {
                    if (optionIds.has(option.id)) {
                        duplicateOptions.push(option.id)
                    } else {
                        optionIds.add(option.id)
                    }
                }
            }

            if (duplicateOptions.length > 0) {
                return response.badRequest({
                    message: 'Cannot select multiple values from the same option',
                    duplicate_option_ids: duplicateOptions,
                })
            }

            const priceAdders = selectedOptionValues.map((ov) => Number(ov.priceAdder))
            totalPrice =
                Number(product.basePrice) + priceAdders.reduce((sum, adder) => sum + adder, 0)
        }

        const optionValueData = selectedOptionValues.map((ov) => {
            const option = product.options.find((o) => o.values.some((v) => v.id === ov.id))
            return {
                option_id: option?.id || null,
                option_name: option?.name || null,
                option_created_at: option?.createdAt || null,
                value_id: ov.id,
                value_name: ov.name,
                price_adder: Number(ov.priceAdder),
                sku: generateOptionValueSku(ov.name),
            }
        })

        optionValueData.sort((a, b) => {
            if (!a.option_created_at || !b.option_created_at) return 0
            return a.option_created_at.toMillis() - b.option_created_at.toMillis()
        })

        const variantSku = generateVariantSku(
            product.sku,
            optionValueData.map((ov) => ({
                optionName: ov.option_name || '',
                valueName: ov.value_name,
            }))
        )

        return response.ok({
            sku: variantSku,
            total_price: totalPrice,
            base_price: Number(product.basePrice),
            configuration: {
                product: {
                    id: product.id,
                    name: product.name,
                    slug: product.slug,
                    base_sku: product.sku,
                },
                selected_options: optionValueData,
            },
        })
    }
}
