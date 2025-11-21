import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'

router.group(() => {
    router
        .get('/login', '#controllers/admin/auth_controller.showLogin')
        .use(middleware.guest())
        .as('login')
    router.post('/login', '#controllers/admin/auth_controller.login')
    router.post('/logout', '#controllers/admin/auth_controller.logout').as('logout')
})

router
    .group(() => {
        router.get('/', '#controllers/admin/dashboard_controller.index').as('dashboard')
        router.get('/products', '#controllers/admin/product_controller.index').as('product')
        router
            .get('/categories', '#controllers/admin/category_controller.index')
            .as('product_category')
        router.get('/options', '#controllers/admin/option_controller.index').as('option')
    })
    .use(middleware.auth())
