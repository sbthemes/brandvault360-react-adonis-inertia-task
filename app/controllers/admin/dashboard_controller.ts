import type { HttpContext } from '@adonisjs/core/http'

export default class AdminDashboardController {
    async index({ inertia }: HttpContext) {
        return inertia.render('index', {})
    }
}
