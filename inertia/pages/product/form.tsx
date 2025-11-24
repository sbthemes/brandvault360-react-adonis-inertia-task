import { Head, router } from '@inertiajs/react'
import AdminLayout from '~/components/layouts/admin-layout'
import ProductForm from '~/components/product/product-form'
import Button from '~/components/ui/button'
import type { ProductFormData } from '~/types/product'
import type { CategoryListItem } from '~/types/category'

interface ProductFormPageProps {
    product?: ProductFormData
    categories: CategoryListItem[]
    availableOptions?: Array<{
        id: number
        name: string
        values: Array<{
            id: number
            name: string
            price_adder: number
        }>
    }>
}

export default function ProductFormPage({
    product,
    categories,
    availableOptions = [],
}: ProductFormPageProps) {
    return (
        <>
            <Head title={product ? 'Edit Product' : 'Create Product'} />
            <AdminLayout>
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                {product ? 'Edit Product' : 'Create Product'}
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">
                                {product
                                    ? 'Update the product information'
                                    : 'Add a new product to your catalog'}
                            </p>
                        </div>
                        <Button variant="secondary" onClick={() => router.visit('/products')}>
                            Back to Products
                        </Button>
                    </div>

                    <div className="bg-white rounded-lg border p-6">
                        <ProductForm
                            product={product}
                            categories={categories || []}
                            availableOptions={availableOptions}
                            onClose={() => router.visit('/products')}
                        />
                    </div>
                </div>
            </AdminLayout>
        </>
    )
}
