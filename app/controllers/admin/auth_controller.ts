import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'
import User from '#models/user'

export default class AdminAuthController {
    async showLogin({ inertia }: HttpContext) {
        return inertia.render('auth/login')
    }

    async login({ request, response, auth, session }: HttpContext) {
        const loginSchema = vine.compile(
            vine.object({
                email: vine.string().email(),
                password: vine.string().minLength(1),
            })
        )

        try {
            const { email, password } = await request.validateUsing(loginSchema)

            const user = await User.verifyCredentials(email, password)
            await auth.use('web').login(user)

            return response.redirect('/admin')
        } catch (error) {
            session.flash('notification', {
                type: 'error',
                message: 'Invalid email or password',
            })

            return response.redirect().back()
        }
    }

    async logout({ auth, response }: HttpContext) {
        await auth.use('web').logout()

        return response.redirect('/admin/login')
    }
}
