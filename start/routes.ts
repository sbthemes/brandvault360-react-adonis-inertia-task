import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
import { BaseModel, SnakeCaseNamingStrategy } from '@adonisjs/lucid/orm'

BaseModel.namingStrategy = new SnakeCaseNamingStrategy()

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

        router.get('/products', '#controllers/admin/product_controller.index').as('products.index')
        router
            .get('/products/create', '#controllers/admin/product_controller.create')
            .as('products.create')
        router.post('/products', '#controllers/admin/product_controller.store').as('products.store')
        router
            .get('/products/:id', '#controllers/admin/product_controller.show')
            .as('products.show')
        router
            .post('/products/:id', '#controllers/admin/product_controller.update')
            .as('products.update')
        router
            .delete('/products/:id', '#controllers/admin/product_controller.destroy')
            .as('products.destroy')
        router
            .get(
                '/products/options/:categoryId',
                '#controllers/admin/product_controller.getOptions'
            )
            .as('products.options')

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
            .post('/categories/:id', '#controllers/admin/category_controller.update')
            .as('categories.update')
        router
            .delete('/categories/:id', '#controllers/admin/category_controller.destroy')
            .as('categories.destroy')

        router.get('/options', '#controllers/admin/option_controller.index').as('options.index')
        router.post('/options', '#controllers/admin/option_controller.store').as('options.store')
        router.get('/options/:id', '#controllers/admin/option_controller.show').as('options.show')
        router
            .post('/options/:id', '#controllers/admin/option_controller.update')
            .as('options.update')
        router
            .delete('/options/:id', '#controllers/admin/option_controller.destroy')
            .as('options.destroy')
    })
    .use(middleware.auth())

router
    .group(() => {
        router.get('/categories', '#controllers/api/configurator_controller.getCategories')
        router.get(
            '/products/:categoryId',
            '#controllers/api/configurator_controller.getProductsByCategory'
        )
        router.get('/configure', '#controllers/api/configurator_controller.configure')
    })
    .prefix('/api')
