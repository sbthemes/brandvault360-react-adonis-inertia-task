import * as React from 'react'
import { Head, router } from '@inertiajs/react'
import { AlertDialog, Flex } from '@radix-ui/themes'
import AdminLayout from '~/components/layouts/admin-layout'
import OptionTable from '~/components/option/option-table'
import OptionForm from '~/components/option/option-form'
import Button from '~/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '~/components/ui/dialog'
import type { Option, OptionPageProps } from '~/types/option'

export default function OptionIndex({ options, categories }: OptionPageProps) {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
    const [selectedOption, setSelectedOption] = React.useState<Option | null>(null)

    const handleEdit = (option: Option) => {
        setSelectedOption(option)
        setIsEditDialogOpen(true)
    }

    const handleDelete = (option: Option) => {
        setSelectedOption(option)
        setIsDeleteDialogOpen(true)
    }

    const confirmDelete = () => {
        if (selectedOption) {
            router.delete(`/options/${selectedOption.id}`, {
                preserveScroll: true,
                onFinish: () => {
                    setSelectedOption(null)
                },
            })
        }
    }

    const defaultOptions = {
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

    const optionFormData = selectedOption
        ? {
              id: selectedOption.id,
              name: selectedOption.name,
              category_ids: selectedOption.categories?.map((c) => c.id) || [],
              values:
                  selectedOption.values?.map((v) => ({
                      id: v.id,
                      name: v.name,
                      price_adder: v.price_adder,
                  })) || [],
          }
        : undefined

    return (
        <>
            <Head title="Options" />
            <AdminLayout>
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold text-gray-900">Options</h1>
                        <Button onClick={() => setIsCreateDialogOpen(true)}>Create Option</Button>
                    </div>

                    <OptionTable
                        options={options || defaultOptions}
                        categories={categories || []}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogContent className="max-w-4xl">
                        <DialogHeader>
                            <DialogTitle>Create Option</DialogTitle>
                            <DialogDescription>
                                Add a new option with values (e.g., Size: S, M, L).
                            </DialogDescription>
                        </DialogHeader>
                        <OptionForm
                            categories={categories || []}
                            onClose={() => setIsCreateDialogOpen(false)}
                        />
                    </DialogContent>
                </Dialog>

                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent className="max-w-4xl">
                        <DialogHeader>
                            <DialogTitle>Edit Option</DialogTitle>
                            <DialogDescription>
                                Update the option information and values.
                            </DialogDescription>
                        </DialogHeader>
                        {optionFormData && (
                            <OptionForm
                                option={optionFormData}
                                categories={categories || []}
                                onClose={() => {
                                    setIsEditDialogOpen(false)
                                    setSelectedOption(null)
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
                            setSelectedOption(null)
                        }
                    }}
                >
                    <AlertDialog.Content maxWidth="450px">
                        <AlertDialog.Title>Delete Option</AlertDialog.Title>
                        <AlertDialog.Description size="2">
                            Are you sure you want to delete "{selectedOption?.name}"? This action
                            cannot be undone and will delete all associated values.
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
