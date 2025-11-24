import type { PaginatedResponse } from './pagination'
import type { CategoryListItem } from './category'

export interface OptionValue {
    id: number
    option_id: number
    name: string
    price_adder: number
    created_at: string
    updated_at: string | null
}

export interface Option {
    id: number
    name: string
    values: OptionValue[]
    categories: CategoryListItem[]
    created_at: string
    updated_at: string | null
}

export interface OptionFormData {
    id?: number
    name: string
    category_ids: number[]
    values: Array<{
        id?: number
        name: string
        price_adder: number
    }>
}

export interface OptionPageProps {
    options: PaginatedResponse<Option>
    categories: CategoryListItem[]
    [key: string]: any
}
