import * as React from 'react'
import { Head, router } from '@inertiajs/react'
import { AlertDialog, Flex } from '@radix-ui/themes'
import AdminLayout from '~/components/layouts/admin-layout'
import ProductTable from '~/components/product/product-table'
import Button from '~/components/ui/button'
import type { Product, ProductPageProps } from '~/types/product'

export default function ProductIndex({ products }: ProductPageProps) {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
    const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null)

    const handleDelete = (product: Product) => {
        setSelectedProduct(product)
        setIsDeleteDialogOpen(true)
    }

    const confirmDelete = () => {
        if (selectedProduct) {
            router.delete(`/admin/products/${selectedProduct.id}`, {
                preserveScroll: true,
                onFinish: () => {
                    setSelectedProduct(null)
                },
            })
        }
    }

    const defaultProducts = {
        data: [],
        meta: {
            total: 0,
            per_page: 15,
            current_page: 1,
            last_page: 1,
            first_page: 1,
            first_page_url: '/?page=1',
            last_page_url: '/?page=1',
            next_page_url: null,
            previous_page_url: null,
        },
    }

    return (
        <>
            <Head title="Products" />
            <AdminLayout>
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold text-gray-900">Products</h1>
                        <Button onClick={() => router.visit('/admin/products/create')}>
                            Create Product
                        </Button>
                    </div>

                    <ProductTable products={products || defaultProducts} onDelete={handleDelete} />
                </div>

                <AlertDialog.Root
                    open={isDeleteDialogOpen}
                    onOpenChange={(open) => {
                        setIsDeleteDialogOpen(open)
                        if (!open) {
                            setSelectedProduct(null)
                        }
                    }}
                >
                    <AlertDialog.Content maxWidth="450px">
                        <AlertDialog.Title>Delete Product</AlertDialog.Title>
                        <AlertDialog.Description size="2">
                            Are you sure you want to delete "{selectedProduct?.name}"? This action
                            cannot be undone.
                        </AlertDialog.Description>
                        <Flex gap="3" mt="4" justify="end">
                            <AlertDialog.Cancel>
                                <Button variant="secondary">Cancel</Button>
                            </AlertDialog.Cancel>
                            <AlertDialog.Action>
                                <Button variant="danger" onClick={confirmDelete}>
                                    Delete
                                </Button>
                            </AlertDialog.Action>
                        </Flex>
                    </AlertDialog.Content>
                </AlertDialog.Root>
            </AdminLayout>
        </>
    )
}
