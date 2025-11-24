import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Category from '#models/category'
import { generateSlug } from '../../app/utils/slug_helper.js'

export default class extends BaseSeeder {
    async run() {
        const categories = [
            {
                name: "Men's T-Shirts",
                description:
                    'Comfortable and stylish t-shirts for men in various styles and colors',
            },
            {
                name: "Women's T-Shirts",
                description: 'Trendy and comfortable t-shirts designed for women',
            },
            {
                name: 'Hoodies',
                description: 'Warm and cozy hoodies perfect for casual wear',
            },
            {
                name: 'Polo Shirts',
                description: 'Classic polo shirts for a smart casual look',
            },
            {
                name: 'Tank Tops',
                description: 'Lightweight tank tops for active wear and summer',
            },
        ]

        for (const categoryData of categories) {
            const existingCategory = await Category.findBy('slug', generateSlug(categoryData.name))

            if (!existingCategory) {
                await Category.create({
                    name: categoryData.name,
                    slug: generateSlug(categoryData.name),
                    description: categoryData.description,
                    image: null,
                })
            }
        }
    }
}
