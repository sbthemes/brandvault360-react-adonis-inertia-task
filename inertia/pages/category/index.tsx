import * as React from 'react'
import { Head, router } from '@inertiajs/react'
import { AlertDialog, Flex } from '@radix-ui/themes'
import AdminLayout from '~/components/layouts/admin-layout'
import CategoryTable from '~/components/category/category-table'
import CategoryForm from '~/components/category/category-form'
import Button from '~/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '~/components/ui/dialog'

interface Category {
    id: number
    name: string
    slug: string
    description: string | null
    image: string | null
    created_at: string
    updated_at: string | null
}

interface CategoryPageProps {
    categories: {
        data: Category[]
        meta: {
            total: number
            perPage: number
            currentPage: number
            lastPage: number
            firstPage: number
            firstPageUrl: string
            lastPageUrl: string
            nextPageUrl: string | null
            previousPageUrl: string | null
        }
    }
    [key: string]: any
}

export default function CategoryIndex({ categories }: CategoryPageProps) {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
    const [selectedCategory, setSelectedCategory] = React.useState<Category | null>(null)

    const handleEdit = (category: Category) => {
        setSelectedCategory(category)
        setIsEditDialogOpen(true)
    }

    const handleDelete = (category: Category) => {
        setSelectedCategory(category)
        setIsDeleteDialogOpen(true)
    }

    const confirmDelete = () => {
        if (selectedCategory) {
            router.delete(`/categories/${selectedCategory.id}`, {
                preserveScroll: true,
                onFinish: () => {
                    setSelectedCategory(null)
                },
            })
        }
    }

    const defaultCategories = {
        data: [],
        meta: {
            total: 0,
            perPage: 15,
            currentPage: 1,
            lastPage: 1,
            firstPage: 1,
            firstPageUrl: '/?page=1',
            lastPageUrl: '/?page=1',
            nextPageUrl: null,
            previousPageUrl: null,
        },
    }

    return (
        <>
            <Head title="Categories" />
            <AdminLayout>
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
                        <Button onClick={() => setIsCreateDialogOpen(true)}>Create Category</Button>
                    </div>

                    <CategoryTable
                        categories={categories || defaultCategories}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Create Category</DialogTitle>
                            <DialogDescription>
                                Add a new category to organize your products.
                            </DialogDescription>
                        </DialogHeader>
                        <CategoryForm onClose={() => setIsCreateDialogOpen(false)} />
                    </DialogContent>
                </Dialog>

                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Edit Category</DialogTitle>
                            <DialogDescription>Update the category information.</DialogDescription>
                        </DialogHeader>
                        {selectedCategory && (
                            <CategoryForm
                                category={selectedCategory}
                                onClose={() => {
                                    setIsEditDialogOpen(false)
                                    setSelectedCategory(null)
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
                            setSelectedCategory(null)
                        }
                    }}
                >
                    <AlertDialog.Content maxWidth="450px">
                        <AlertDialog.Title>Delete Category</AlertDialog.Title>
                        <AlertDialog.Description size="2">
                            Are you sure you want to delete "{selectedCategory?.name}"? This action
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
