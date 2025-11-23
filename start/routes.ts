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
            .as('categories.index')
        router
            .post('/categories', '#controllers/admin/category_controller.store')
            .as('categories.store')
        router
            .get('/categories/:id', '#controllers/admin/category_controller.show')
            .as('categories.show')
        router
            .put('/categories/:id', '#controllers/admin/category_controller.update')
            .as('categories.update')
        router
            .post('/categories/:id', '#controllers/admin/category_controller.update')
            .as('categories.update.post')
        router
            .delete('/categories/:id', '#controllers/admin/category_controller.destroy')
            .as('categories.destroy')

        router.get('/options', '#controllers/admin/option_controller.index').as('option')
    })
    .use(middleware.auth())
