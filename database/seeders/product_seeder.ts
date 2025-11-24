import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Product from '#models/product'
import Category from '#models/category'
import Option from '#models/option'
import OptionValue from '#models/option_value'
import { generateSlug } from '../../app/utils/slug_helper.js'
import { generateBaseSku, ensureUniqueSku } from '../../app/utils/sku_helper.js'

export default class extends BaseSeeder {
    async run() {
        const mensTShirts = await Category.findBy('slug', 'mens-t-shirts')
        const womensTShirts = await Category.findBy('slug', 'womens-t-shirts')
        const hoodies = await Category.findBy('slug', 'hoodies')
        const poloShirts = await Category.findBy('slug', 'polo-shirts')
        const tankTops = await Category.findBy('slug', 'tank-tops')

        const sizeOption = await Option.findBy('name', 'Size')
        const colorOption = await Option.findBy('name', 'Color')
        const materialOption = await Option.findBy('name', 'Material')

        const sizeValues = await OptionValue.query().where('option_id', sizeOption!.id)
        const colorValues = await OptionValue.query().where('option_id', colorOption!.id)
        const materialValues = await OptionValue.query().where('option_id', materialOption!.id)

        const getSizeValue = (name: string) => sizeValues.find((v) => v.name === name)
        const getColorValue = (name: string) => colorValues.find((v) => v.name === name)
        const getMaterialValue = (name: string) => materialValues.find((v) => v.name === name)

        const products = [
            {
                category: mensTShirts,
                name: 'Crew Neck T-Shirt',
                description:
                    'Classic crew neck t-shirt made from 100% cotton. Perfect for everyday wear.',
                basePrice: 19.99,
                options: [sizeOption, colorOption],
                optionValues: [
                    getSizeValue('S'),
                    getSizeValue('M'),
                    getSizeValue('L'),
                    getSizeValue('XL'),
                    getColorValue('Black'),
                    getColorValue('White'),
                    getColorValue('Gray'),
                    getColorValue('Blue'),
                ],
            },
            {
                category: mensTShirts,
                name: 'V-Neck T-Shirt',
                description:
                    'Comfortable v-neck t-shirt with a modern fit. Great for layering or wearing alone.',
                basePrice: 21.99,
                options: [sizeOption, colorOption, materialOption],
                optionValues: [
                    getSizeValue('S'),
                    getSizeValue('M'),
                    getSizeValue('L'),
                    getColorValue('Black'),
                    getColorValue('White'),
                    getColorValue('Navy Blue'),
                    getColorValue('Red'),
                    getMaterialValue('100% Cotton'),
                    getMaterialValue('Cotton Blend'),
                ],
            },
            {
                category: mensTShirts,
                name: 'Long Sleeve T-Shirt',
                description:
                    'Versatile long sleeve t-shirt ideal for cooler weather or as a base layer.',
                basePrice: 24.99,
                options: [sizeOption, colorOption],
                optionValues: [
                    getSizeValue('M'),
                    getSizeValue('L'),
                    getSizeValue('XL'),
                    getSizeValue('XXL'),
                    getColorValue('Black'),
                    getColorValue('Gray'),
                    getColorValue('Navy Blue'),
                ],
            },
            {
                category: womensTShirts,
                name: 'Fitted T-Shirt',
                description:
                    'Flattering fitted t-shirt with a feminine cut. Available in multiple colors.',
                basePrice: 22.99,
                options: [sizeOption, colorOption],
                optionValues: [
                    getSizeValue('S'),
                    getSizeValue('M'),
                    getSizeValue('L'),
                    getColorValue('Black'),
                    getColorValue('White'),
                    getColorValue('Red'),
                    getColorValue('Green'),
                ],
            },
            {
                category: womensTShirts,
                name: 'Oversized T-Shirt',
                description: 'Trendy oversized t-shirt for a relaxed, comfortable fit.',
                basePrice: 25.99,
                options: [sizeOption, colorOption],
                optionValues: [
                    getSizeValue('S'),
                    getSizeValue('M'),
                    getSizeValue('L'),
                    getSizeValue('XL'),
                    getColorValue('Black'),
                    getColorValue('White'),
                    getColorValue('Gray'),
                    getColorValue('Blue'),
                ],
            },
            {
                category: womensTShirts,
                name: 'Crop Top T-Shirt',
                description: 'Stylish crop top t-shirt perfect for summer and casual outings.',
                basePrice: 20.99,
                options: [sizeOption, colorOption],
                optionValues: [
                    getSizeValue('S'),
                    getSizeValue('M'),
                    getColorValue('White'),
                    getColorValue('Red'),
                    getColorValue('Green'),
                ],
            },
            {
                category: hoodies,
                name: 'Classic Pullover Hoodie',
                description:
                    'Warm and comfortable pullover hoodie with front pocket. Perfect for casual wear.',
                basePrice: 39.99,
                options: [sizeOption, colorOption],
                optionValues: [
                    getSizeValue('S'),
                    getSizeValue('M'),
                    getSizeValue('L'),
                    getSizeValue('XL'),
                    getSizeValue('XXL'),
                    getColorValue('Black'),
                    getColorValue('Gray'),
                    getColorValue('Navy Blue'),
                ],
            },
            {
                category: hoodies,
                name: 'Zip-Up Hoodie',
                description:
                    'Versatile zip-up hoodie with full front zipper. Easy to layer and adjust.',
                basePrice: 42.99,
                options: [sizeOption, colorOption, materialOption],
                optionValues: [
                    getSizeValue('M'),
                    getSizeValue('L'),
                    getSizeValue('XL'),
                    getColorValue('Black'),
                    getColorValue('Navy Blue'),
                    getMaterialValue('100% Cotton'),
                    getMaterialValue('Cotton Blend'),
                ],
            },
            {
                category: hoodies,
                name: 'Slim Fit Hoodie',
                description:
                    'Modern slim fit hoodie with a tailored silhouette. Great for a more polished look.',
                basePrice: 44.99,
                options: [sizeOption, colorOption],
                optionValues: [
                    getSizeValue('S'),
                    getSizeValue('M'),
                    getSizeValue('L'),
                    getColorValue('Black'),
                    getColorValue('Navy Blue'),
                ],
            },
            {
                category: poloShirts,
                name: 'Classic Polo Shirt',
                description:
                    'Timeless polo shirt with three-button placket. Perfect for smart casual occasions.',
                basePrice: 34.99,
                options: [sizeOption, colorOption],
                optionValues: [
                    getSizeValue('S'),
                    getSizeValue('M'),
                    getSizeValue('L'),
                    getSizeValue('XL'),
                    getColorValue('White'),
                    getColorValue('Navy Blue'),
                    getColorValue('Red'),
                ],
            },
            {
                category: poloShirts,
                name: 'Pique Polo Shirt',
                description:
                    'Premium pique fabric polo shirt with a refined texture and professional appearance.',
                basePrice: 39.99,
                options: [sizeOption, colorOption, materialOption],
                optionValues: [
                    getSizeValue('M'),
                    getSizeValue('L'),
                    getSizeValue('XL'),
                    getColorValue('White'),
                    getColorValue('Navy Blue'),
                    getMaterialValue('100% Cotton'),
                    getMaterialValue('Organic Cotton'),
                ],
            },
            {
                category: tankTops,
                name: 'Ribbed Tank Top',
                description: 'Comfortable ribbed tank top perfect for workouts or hot weather.',
                basePrice: 16.99,
                options: [sizeOption, colorOption],
                optionValues: [
                    getSizeValue('S'),
                    getSizeValue('M'),
                    getSizeValue('L'),
                    getColorValue('Black'),
                    getColorValue('White'),
                    getColorValue('Gray'),
                ],
            },
            {
                category: tankTops,
                name: 'Muscle Tank Top',
                description: 'Athletic muscle tank top with wide armholes. Ideal for active wear.',
                basePrice: 18.99,
                options: [sizeOption, colorOption],
                optionValues: [
                    getSizeValue('M'),
                    getSizeValue('L'),
                    getSizeValue('XL'),
                    getColorValue('Black'),
                    getColorValue('Gray'),
                ],
            },
            {
                category: tankTops,
                name: 'Sleeveless V-Neck',
                description: 'Stylish sleeveless v-neck top for a casual, relaxed look.',
                basePrice: 17.99,
                options: [],
                optionValues: [],
            },
        ]

        for (const productData of products) {
            if (!productData.category) {
                continue
            }

            const slug = generateSlug(productData.name)
            const existingProduct = await Product.findBy('slug', slug)

            if (!existingProduct) {
                const product = await Product.create({
                    name: productData.name,
                    slug,
                    sku: null,
                    categoryId: productData.category.id,
                    description: productData.description,
                    basePrice: productData.basePrice,
                    image: null,
                })

                const baseSku = generateBaseSku(
                    productData.category.name,
                    product.id,
                    productData.name
                )
                const uniqueSku = await ensureUniqueSku(baseSku, product.id)
                product.sku = uniqueSku
                await product.save()

                if (productData.options && productData.options.length > 0) {
                    const optionIds = productData.options.filter(Boolean).map((opt) => opt!.id)
                    await product.related('options').attach(optionIds)
                }

                if (productData.optionValues && productData.optionValues.length > 0) {
                    const optionValueIds = productData.optionValues
                        .filter(Boolean)
                        .map((ov) => ov!.id)
                    await product.related('optionValues').attach(optionValueIds)
                }
            }
        }
    }
}
