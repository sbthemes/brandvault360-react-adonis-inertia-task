import type { HttpContext } from '@adonisjs/core/http'

export default class OptionController {
    async index({ inertia }: HttpContext) {
        return inertia.render('option/index', {})
    }
}
