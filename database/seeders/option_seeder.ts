import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Option from '#models/option'
import OptionValue from '#models/option_value'
import Category from '#models/category'

export default class extends BaseSeeder {
    async run() {
        const mensTShirts = await Category.findBy('slug', 'mens-t-shirts')
        const womensTShirts = await Category.findBy('slug', 'womens-t-shirts')
        const hoodies = await Category.findBy('slug', 'hoodies')
        const poloShirts = await Category.findBy('slug', 'polo-shirts')
        const tankTops = await Category.findBy('slug', 'tank-tops')

        const allCategories = [mensTShirts, womensTShirts, hoodies, poloShirts, tankTops].filter(
            Boolean
        )

        let sizeOption = await Option.findBy('name', 'Size')
        if (!sizeOption) {
            sizeOption = await Option.create({ name: 'Size' })
        }

        const sizeValues = [
            { name: 'S', price_adder: 0 },
            { name: 'M', price_adder: 0 },
            { name: 'L', price_adder: 0 },
            { name: 'XL', price_adder: 2 },
            { name: 'XXL', price_adder: 4 },
        ]

        for (const sizeValue of sizeValues) {
            const existingValue = await OptionValue.query()
                .where('option_id', sizeOption.id)
                .where('name', sizeValue.name)
                .first()

            if (!existingValue) {
                await OptionValue.create({
                    optionId: sizeOption.id,
                    name: sizeValue.name,
                    priceAdder: sizeValue.price_adder,
                })
            }
        }

        await sizeOption.related('categories').sync(allCategories.map((cat) => cat!.id))

        let colorOption = await Option.findBy('name', 'Color')
        if (!colorOption) {
            colorOption = await Option.create({ name: 'Color' })
        }

        const colorValues = [
            { name: 'Black', price_adder: 0 },
            { name: 'White', price_adder: 0 },
            { name: 'Gray', price_adder: 0 },
            { name: 'Navy Blue', price_adder: 1 },
            { name: 'Red', price_adder: 1 },
            { name: 'Green', price_adder: 1 },
            { name: 'Blue', price_adder: 0 },
        ]

        for (const colorValue of colorValues) {
            const existingValue = await OptionValue.query()
                .where('option_id', colorOption.id)
                .where('name', colorValue.name)
                .first()

            if (!existingValue) {
                await OptionValue.create({
                    optionId: colorOption.id,
                    name: colorValue.name,
                    priceAdder: colorValue.price_adder,
                })
            }
        }

        await colorOption.related('categories').sync(allCategories.map((cat) => cat!.id))

        let materialOption = await Option.findBy('name', 'Material')
        if (!materialOption) {
            materialOption = await Option.create({ name: 'Material' })
        }

        const materialValues = [
            { name: '100% Cotton', price_adder: 0 },
            { name: 'Cotton Blend', price_adder: -2 },
            { name: 'Polyester', price_adder: -3 },
            { name: 'Organic Cotton', price_adder: 3 },
        ]

        for (const materialValue of materialValues) {
            const existingValue = await OptionValue.query()
                .where('option_id', materialOption.id)
                .where('name', materialValue.name)
                .first()

            if (!existingValue) {
                await OptionValue.create({
                    optionId: materialOption.id,
                    name: materialValue.name,
                    priceAdder: materialValue.price_adder,
                })
            }
        }

        await materialOption.related('categories').sync(allCategories.map((cat) => cat!.id))
    }
}
