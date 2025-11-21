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

            session.flash('success', 'Login successful!')

            return response.redirect('/')
        } catch (error) {
            if (error.messages) {
                session.flash('errors', error.messages)
            } else {
                session.flash('error', 'Invalid email or password')
            }
            return response.redirect().back()
        }
    }

    async logout({ auth, response, session }: HttpContext) {
        await auth.use('web').logout()
        session.flash('success', 'Logged out successfully')
        return response.redirect('/login')
    }
}
