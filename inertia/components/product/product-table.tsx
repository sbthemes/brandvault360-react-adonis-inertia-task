import { useState, useEffect } from 'react'
import { router } from '@inertiajs/react'
import { Table } from '@radix-ui/themes'
import Input from '~/components/ui/input'
import Button from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Pencil, Trash2, Search } from 'lucide-react'
import Pagination from '~/components/ui/pagination'
import type { Product } from '~/types/product'
import type { PaginatedResponse } from '~/types/pagination'

interface ProductTableProps {
    products: PaginatedResponse<Product>
    onEdit: (product: Product) => void
    onDelete: (product: Product) => void
}

export default function ProductTable({ products, onEdit, onDelete }: ProductTableProps) {
    const [search, setSearch] = useState('')
    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)

    const handleSearch = (value: string) => {
        setSearch(value)

        if (searchTimeout) {
            clearTimeout(searchTimeout)
        }

        const timeout = setTimeout(() => {
            router.get(
                '/products',
                { search: value, page: 1 },
                {
                    preserveState: true,
                    preserveScroll: true,
                }
            )
        }, 500)

        setSearchTimeout(timeout)
    }

    useEffect(() => {
        return () => {
            if (searchTimeout) {
                clearTimeout(searchTimeout)
            }
        }
    }, [searchTimeout])

    const handlePageChange = (page: number) => {
        router.get(
            '/products',
            { page, search },
            {
                preserveState: true,
                preserveScroll: false,
            }
        )
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(price)
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle></CardTitle>
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Search products..."
                            value={search}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {products.data.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <p>No products found</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <Table.Root variant="surface" size="2">
                                <Table.Header>
                                    <Table.Row>
                                        <Table.ColumnHeaderCell>Image</Table.ColumnHeaderCell>
                                        <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
                                        <Table.ColumnHeaderCell>Slug</Table.ColumnHeaderCell>
                                        <Table.ColumnHeaderCell>Category</Table.ColumnHeaderCell>
                                        <Table.ColumnHeaderCell>Base Price</Table.ColumnHeaderCell>
                                        <Table.ColumnHeaderCell justify="end">
                                            Actions
                                        </Table.ColumnHeaderCell>
                                    </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                    {products.data.map((product) => (
                                        <Table.Row key={product.id}>
                                            <Table.Cell>
                                                {product.image ? (
                                                    <img
                                                        src={product.image}
                                                        alt={product.name}
                                                        className="h-12 w-12 object-cover rounded"
                                                        onError={(e) => {
                                                            e.currentTarget.style.display = 'none'
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="h-12 w-12 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
                                                        No Image
                                                    </div>
                                                )}
                                            </Table.Cell>
                                            <Table.Cell>
                                                <div className="font-medium">{product.name}</div>
                                            </Table.Cell>
                                            <Table.Cell>
                                                <div className="text-sm text-gray-600">
                                                    {product.slug}
                                                </div>
                                            </Table.Cell>
                                            <Table.Cell>
                                                <div className="text-sm">
                                                    {product.category?.name || 'N/A'}
                                                </div>
                                            </Table.Cell>
                                            <Table.Cell>
                                                <div className="text-sm font-medium">
                                                    {formatPrice(Number(product.base_price))}
                                                </div>
                                            </Table.Cell>
                                            <Table.Cell justify="end">
                                                <div className="flex justify-end space-x-2">
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        onClick={() => onEdit(product)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        onClick={() => onDelete(product)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </Table.Cell>
                                        </Table.Row>
                                    ))}
                                </Table.Body>
                            </Table.Root>
                        </div>

                        <Pagination
                            currentPage={products.meta?.current_page || 1}
                            lastPage={products.meta?.last_page || 1}
                            onPageChange={handlePageChange}
                        />
                    </>
                )}
            </CardContent>
        </Card>
    )
}
