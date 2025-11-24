import type { PaginatedResponse } from './pagination'
import type { CategoryListItem } from './category'

export interface Product {
    id: number
    name: string
    slug: string
    category_id: number
    description: string | null
    base_price: number
    image: string | null
    category: CategoryListItem
    created_at: string
    updated_at: string | null
}

export interface ProductFormData {
    id: number
    name: string
    slug: string
    category_id: number
    description: string | null
    base_price: number
    image: string | null
}

export interface ProductPageProps {
    products: PaginatedResponse<Product>
    categories: CategoryListItem[]
    [key: string]: any
}
