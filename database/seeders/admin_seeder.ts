import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'

export default class extends BaseSeeder {
    async run() {
        const existingAdmin = await User.findBy('email', 'admin@example.com')

        if (!existingAdmin) {
            await User.create({
                email: 'admin@example.com',
                password: 'password',
                fullName: 'Admin User',
            })
        }
    }
}
