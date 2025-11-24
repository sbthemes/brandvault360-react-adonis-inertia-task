import type { PaginatedResponse } from './pagination'
import type { CategoryListItem } from './category'
import type { Option } from './option'

export interface Product {
    id: number
    name: string
    slug: string
    sku: string | null
    category_id: number
    description: string | null
    base_price: number
    image: string | null
    category: CategoryListItem
    options?: Option[]
    option_values?: Array<{
        id: number
        name: string
        price_adder: number
        option_id: number
    }>
    created_at: string
    updated_at: string | null
}

export interface ProductFormData {
    id?: number
    name: string
    slug: string
    sku?: string | null
    category_id: number
    description: string | null
    base_price: number
    image: string | null
    option_ids?: number[]
    option_value_ids?: number[]
}

export interface ProductPageProps {
    products: PaginatedResponse<Product>
    [key: string]: any
}
