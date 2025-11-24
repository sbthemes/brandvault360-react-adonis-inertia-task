import * as React from 'react'
import { Head, router } from '@inertiajs/react'
import { AlertDialog, Flex } from '@radix-ui/themes'
import AdminLayout from '~/components/layouts/admin-layout'
import ProductTable from '~/components/product/product-table'
import ProductForm from '~/components/product/product-form'
import Button from '~/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '~/components/ui/dialog'
import type { Product, ProductPageProps } from '~/types/product'

export default function ProductIndex({ products, categories }: ProductPageProps) {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
    const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null)

    const handleEdit = (product: Product) => {
        setSelectedProduct(product)
        setIsEditDialogOpen(true)
    }

    const handleDelete = (product: Product) => {
        setSelectedProduct(product)
        setIsDeleteDialogOpen(true)
    }

    const confirmDelete = () => {
        if (selectedProduct) {
            router.delete(`/products/${selectedProduct.id}`, {
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
                        <Button onClick={() => setIsCreateDialogOpen(true)}>Create Product</Button>
                    </div>

                    <ProductTable
                        products={products || defaultProducts}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Create Product</DialogTitle>
                            <DialogDescription>
                                Add a new product to your catalog.
                            </DialogDescription>
                        </DialogHeader>
                        <ProductForm
                            categories={categories || []}
                            onClose={() => setIsCreateDialogOpen(false)}
                        />
                    </DialogContent>
                </Dialog>

                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Edit Product</DialogTitle>
                            <DialogDescription>Update the product information.</DialogDescription>
                        </DialogHeader>
                        {selectedProduct && (
                            <ProductForm
                                product={{
                                    id: selectedProduct.id,
                                    name: selectedProduct.name,
                                    slug: selectedProduct.slug,
                                    category_id: selectedProduct.category_id,
                                    description: selectedProduct.description,
                                    base_price: selectedProduct.base_price,
                                    image: selectedProduct.image,
                                }}
                                categories={categories || []}
                                onClose={() => {
                                    setIsEditDialogOpen(false)
                                    setSelectedProduct(null)
                                }}
                            />
                        )}
                    </DialogContent>
                </Dialog>

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
