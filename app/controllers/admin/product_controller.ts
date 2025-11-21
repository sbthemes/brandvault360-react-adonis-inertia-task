import type { HttpContext } from '@adonisjs/core/http'

export default class ProductCategoryController {
    async index({ inertia }: HttpContext) {
        return inertia.render('product/index', {})
    }
}
