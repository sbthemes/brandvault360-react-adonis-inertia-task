import { useState, useEffect } from 'react'
import { router } from '@inertiajs/react'
import { Table } from '@radix-ui/themes'
import Input from '~/components/ui/input'
import Button from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Pencil, Trash2, Search } from 'lucide-react'
import Pagination from '~/components/ui/pagination'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '~/components/ui/select'
import type { Option } from '~/types/option'
import type { PaginatedResponse } from '~/types/pagination'
import type { CategoryListItem } from '~/types/category'

interface OptionTableProps {
    options: PaginatedResponse<Option>
    categories: CategoryListItem[]
    onEdit: (option: Option) => void
    onDelete: (option: Option) => void
}

export default function OptionTable({ options, categories, onEdit, onDelete }: OptionTableProps) {
    const [search, setSearch] = useState('')
    const [categoryFilter, setCategoryFilter] = useState<string>('all')
    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)

    const handleSearch = (value: string) => {
        setSearch(value)

        if (searchTimeout) {
            clearTimeout(searchTimeout)
        }

        const timeout = setTimeout(() => {
            router.get(
                '/options',
                {
                    search: value,
                    category_id: categoryFilter === 'all' ? undefined : categoryFilter,
                    page: 1,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                }
            )
        }, 500)

        setSearchTimeout(timeout)
    }

    const handleCategoryFilter = (value: string) => {
        setCategoryFilter(value)
        router.get(
            '/options',
            { search, category_id: value === 'all' ? undefined : value, page: 1 },
            {
                preserveState: true,
                preserveScroll: true,
            }
        )
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
            '/options',
            { page, search, category_id: categoryFilter === 'all' ? undefined : categoryFilter },
            {
                preserveState: true,
                preserveScroll: false,
            }
        )
    }

    const formatPriceAdder = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(price)
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between gap-4">
                    <CardTitle></CardTitle>
                    <div className="flex items-center gap-2">
                        <div className="w-48">
                            <Select
                                value={categoryFilter || 'all'}
                                onValueChange={handleCategoryFilter}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Filter by category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {categories.map((category) => (
                                        <SelectItem key={category.id} value={String(category.id)}>
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                type="text"
                                placeholder="Search options..."
                                value={search}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {options.data.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <p>No options found</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <Table.Root variant="surface" size="2">
                                <Table.Header>
                                    <Table.Row>
                                        <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
                                        <Table.ColumnHeaderCell>Categories</Table.ColumnHeaderCell>
                                        <Table.ColumnHeaderCell>Values</Table.ColumnHeaderCell>
                                        <Table.ColumnHeaderCell justify="end">
                                            Actions
                                        </Table.ColumnHeaderCell>
                                    </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                    {options.data.map((option) => (
                                        <Table.Row key={option.id}>
                                            <Table.Cell>
                                                <div className="font-medium max-w-[200px] truncate">
                                                    {option.name}
                                                </div>
                                            </Table.Cell>
                                            <Table.Cell>
                                                <div className="text-sm text-gray-600 max-w-[400px] truncate">
                                                    {option.categories &&
                                                    option.categories.length > 0 ? (
                                                        <span>
                                                            {option.categories
                                                                .map((cat) => cat.name)
                                                                .join(', ')}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400 italic">
                                                            No categories
                                                        </span>
                                                    )}
                                                </div>
                                            </Table.Cell>
                                            <Table.Cell>
                                                <div className="text-sm">
                                                    {option.values && option.values.length > 0 ? (
                                                        <div className="space-y-1">
                                                            <div className="font-medium">
                                                                {option.values.length} value
                                                                {option.values.length !== 1
                                                                    ? 's'
                                                                    : ''}
                                                            </div>
                                                            <div className="text-xs text-gray-500 space-y-0.5 line-clamp-5">
                                                                {option.values.map((value, idx) => (
                                                                    <div key={idx}>
                                                                        {value.name} (
                                                                        {formatPriceAdder(
                                                                            value.price_adder
                                                                        )}
                                                                        )
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 italic">
                                                            No values
                                                        </span>
                                                    )}
                                                </div>
                                            </Table.Cell>
                                            <Table.Cell justify="end">
                                                <div className="flex justify-end space-x-2">
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        onClick={() => onEdit(option)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        onClick={() => onDelete(option)}
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
                            currentPage={options.meta?.current_page || 1}
                            lastPage={options.meta?.last_page || 1}
                            onPageChange={handlePageChange}
                        />
                    </>
                )}
            </CardContent>
        </Card>
    )
}
