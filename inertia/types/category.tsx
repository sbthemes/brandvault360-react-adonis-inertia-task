import type { PaginatedResponse } from './pagination'

export interface Category {
    id: number
    name: string
    slug: string
    description: string | null
    image: string | null
    created_at: string
    updated_at: string | null
}

export interface CategoryListItem {
    id: number
    name: string
}

export interface CategoryFormData {
    id: number
    name: string
    slug: string
    description: string | null
    image: string | null
}

export interface CategoryPageProps {
    categories: PaginatedResponse<Category>
    [key: string]: any
}
