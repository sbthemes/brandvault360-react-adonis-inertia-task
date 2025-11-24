import { useState, useEffect, useCallback } from 'react'
import { useForm } from '@inertiajs/react'
import * as Form from '@radix-ui/react-form'
import RadixFormField from '~/components/ui/radix-form-field'
import RadixFormFieldSelect from '~/components/ui/radix-form-field-select'
import Button from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'
import { ChevronDown, ChevronRight } from 'lucide-react'
import type { ProductFormData } from '~/types/product'
import type { CategoryListItem } from '~/types/category'

interface ProductFormProps {
    product?: ProductFormData
    categories: CategoryListItem[]
    availableOptions?: Array<{
        id: number
        name: string
        values: Array<{
            id: number
            name: string
            price_adder: number
        }>
    }>
    onClose: () => void
}

export default function ProductForm({
    product,
    categories,
    availableOptions = [],
    onClose,
}: ProductFormProps) {
    const [autoGenerateSlug, setAutoGenerateSlug] = useState(!product)
    const [imagePreview, setImagePreview] = useState<string | null>(product?.image || null)
    const [isDragging, setIsDragging] = useState(false)
    const [selectedOptionIds, setSelectedOptionIds] = useState<number[]>(product?.option_ids || [])
    const [selectedOptionValueIds, setSelectedOptionValueIds] = useState<number[]>(
        product?.option_value_ids || []
    )
    const [currentAvailableOptions, setCurrentAvailableOptions] = useState(availableOptions)
    const [previousCategoryId, setPreviousCategoryId] = useState<number | string | null>(
        product?.category_id || null
    )
    const [expandedOptions, setExpandedOptions] = useState<Set<number>>(new Set())

    const form = useForm({
        name: product?.name || '',
        slug: product?.slug || '',
        sku: product?.sku || '',
        category_id: product?.category_id || '',
        description: product?.description || '',
        base_price: product?.base_price || 0,
        image: null as File | null,
        option_ids: selectedOptionIds,
        option_value_ids: selectedOptionValueIds,
    })

    const handleOptionToggle = (optionId: number, checked: boolean) => {
        if (checked) {
            setSelectedOptionIds([...selectedOptionIds, optionId])
            const option = currentAvailableOptions.find((o) => o.id === optionId)
            if (option && option.values.length > 0) {
                setExpandedOptions((prev) => new Set([...prev, optionId]))
            }
        } else {
            setSelectedOptionIds(selectedOptionIds.filter((id) => id !== optionId))
            setExpandedOptions((prev) => {
                const newSet = new Set(prev)
                newSet.delete(optionId)
                return newSet
            })
            const option = currentAvailableOptions.find((o) => o.id === optionId)
            if (option) {
                const valueIdsToRemove = option.values.map((v) => v.id)
                setSelectedOptionValueIds(
                    selectedOptionValueIds.filter((id) => !valueIdsToRemove.includes(id))
                )
            }
        }
    }

    const handleOptionValueToggle = (valueId: number, checked: boolean) => {
        if (checked) {
            setSelectedOptionValueIds([...selectedOptionValueIds, valueId])
        } else {
            setSelectedOptionValueIds(selectedOptionValueIds.filter((id) => id !== valueId))
        }
        if (form.errors.option_value_ids) {
            form.clearErrors('option_value_ids')
        }
    }

    const toggleOptionExpand = (optionId: number) => {
        setExpandedOptions((prev) => {
            const newSet = new Set(prev)
            if (newSet.has(optionId)) {
                newSet.delete(optionId)
            } else {
                newSet.add(optionId)
            }
            return newSet
        })
    }

    const processFile = (file: File) => {
        if (file && file.type.startsWith('image/')) {
            form.setData('image', file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            processFile(file)
            if (form.errors.image) {
                form.clearErrors('image')
            }
        }
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        const file = e.dataTransfer.files?.[0]
        if (file) {
            processFile(file)
        }
    }

    const handleSubmit = useCallback(
        (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault()
            e.stopPropagation()

            if (product) {
                form.post(`/products/${product.id}`, {
                    preserveScroll: true,
                    forceFormData: true,
                })
            } else {
                form.post('/products', {
                    preserveScroll: true,
                    forceFormData: true,
                })
            }
        },
        [form, product, selectedOptionIds, selectedOptionValueIds, currentAvailableOptions]
    )

    const handleClearServerErrors = useCallback(() => {
        form.clearErrors()
    }, [form])

    // initialize available options from props
    useEffect(() => {
        setCurrentAvailableOptions(availableOptions)
    }, [availableOptions])

    // Load products options and values when editing an existing product
    useEffect(() => {
        if (product?.id && product?.category_id) {
            const optionIds = product.option_ids || []
            const optionValueIds = product.option_value_ids || []

            setSelectedOptionIds(optionIds)
            setSelectedOptionValueIds(optionValueIds)
            setPreviousCategoryId(product.category_id)

            fetch(`/products/options/${product.category_id}`)
                .then((res) => res.json())
                .then((data) => {
                    if (data && Array.isArray(data)) {
                        setCurrentAvailableOptions(data)
                    }
                })
                .catch(() => {
                    setCurrentAvailableOptions([])
                })
        } else if (!product?.id) {
            setSelectedOptionIds([])
            setSelectedOptionValueIds([])
            setPreviousCategoryId(null)
        }
    }, [product?.id])

    // fetch available options when category changes
    useEffect(() => {
        const currentCategoryId = form.data.category_id
        if (
            currentCategoryId &&
            previousCategoryId !== null &&
            currentCategoryId !== previousCategoryId
        ) {
            setSelectedOptionIds([])
            setSelectedOptionValueIds([])
            setPreviousCategoryId(currentCategoryId)
            fetch(`/products/options/${currentCategoryId}`)
                .then((res) => res.json())
                .then((data) => {
                    if (data && Array.isArray(data)) {
                        setCurrentAvailableOptions(data)
                    }
                })
                .catch(() => {
                    setCurrentAvailableOptions([])
                })
        } else if (currentCategoryId && previousCategoryId === null && !product?.id) {
            setPreviousCategoryId(currentCategoryId)
            fetch(`/products/options/${currentCategoryId}`)
                .then((res) => res.json())
                .then((data) => {
                    if (data && Array.isArray(data)) {
                        setCurrentAvailableOptions(data)
                    }
                })
                .catch(() => {
                    setCurrentAvailableOptions([])
                })
        } else if (!currentCategoryId) {
            setCurrentAvailableOptions([])
        }
    }, [form.data.category_id, previousCategoryId, product?.id])

    // Sync selected option IDs to form data
    useEffect(() => {
        form.setData('option_ids', selectedOptionIds)
    }, [selectedOptionIds])

    // Sync selected option value IDs to form data
    useEffect(() => {
        form.setData('option_value_ids', selectedOptionValueIds)
    }, [selectedOptionValueIds])

    // Auto generate slug from product name when enabled
    useEffect(() => {
        if (autoGenerateSlug && form.data.name) {
            const generatedSlug = form.data.name
                .toLowerCase()
                .trim()
                .replace(/[^\w\s-]/g, '')
                .replace(/[\s_-]+/g, '-')
                .replace(/^-+|-+$/g, '')
            form.setData('slug', generatedSlug)
        }
    }, [form.data.name, autoGenerateSlug])

    // Clear option values error when all required values are selected
    useEffect(() => {
        if (form.errors.option_value_ids) {
            const hasAllValuesSelected = selectedOptionIds.every((optionId) => {
                const option = currentAvailableOptions.find((o) => o.id === optionId)
                if (option && option.values.length > 0) {
                    return option.values.some((v) => selectedOptionValueIds.includes(v.id))
                }
                return true
            })
            if (hasAllValuesSelected) {
                form.clearErrors('option_value_ids')
            }
        }
    }, [
        selectedOptionIds,
        selectedOptionValueIds,
        currentAvailableOptions,
        form.errors.option_value_ids,
    ])

    return (
        <Form.Root
            onSubmit={handleSubmit}
            onClearServerErrors={handleClearServerErrors}
            className="space-y-4"
        >
            <RadixFormField
                label="Name"
                name="name"
                type="text"
                value={form.data.name}
                onChange={(e) => {
                    form.setData('name', e.target.value)
                    if (form.errors.name) {
                        form.clearErrors('name')
                    }
                }}
                error={form.errors.name}
                serverInvalid={!!form.errors.name}
                required
                placeholder="Enter product name"
            />

            <RadixFormField
                label="Slug"
                name="slug"
                type="text"
                value={form.data.slug}
                onChange={(e) => {
                    form.setData('slug', e.target.value)
                    setAutoGenerateSlug(false)
                    if (form.errors.slug) {
                        form.clearErrors('slug')
                    }
                }}
                error={form.errors.slug}
                serverInvalid={!!form.errors.slug}
                required
                placeholder="Enter product slug"
                labelComponent={
                    <label className="flex items-center space-x-2 text-xs text-gray-500 cursor-pointer">
                        <Checkbox
                            checked={autoGenerateSlug}
                            onCheckedChange={(checked) => setAutoGenerateSlug(checked === true)}
                        />
                        <span>Auto-generate</span>
                    </label>
                }
            />

            <div className="grid grid-cols-2 gap-4">
                <RadixFormFieldSelect
                    label="Category"
                    name="category_id"
                    value={form.data.category_id}
                    onValueChange={(value) => {
                        form.setData('category_id', Number(value))
                        setSelectedOptionIds([])
                        setSelectedOptionValueIds([])
                        if (form.errors.category_id) {
                            form.clearErrors('category_id')
                        }
                    }}
                    options={categories}
                    error={form.errors.category_id}
                    serverInvalid={!!form.errors.category_id}
                    required
                    placeholder="Select a category"
                />

                <RadixFormField
                    label="Base Price"
                    name="base_price"
                    type="number"
                    value={form.data.base_price}
                    onChange={(e) => {
                        form.setData('base_price', parseFloat(e.target.value) || 0)
                        if (form.errors.base_price) {
                            form.clearErrors('base_price')
                        }
                    }}
                    error={form.errors.base_price}
                    serverInvalid={!!form.errors.base_price}
                    required
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                />
            </div>

            <RadixFormField
                label="Description"
                name="description"
                type="textarea"
                value={form.data.description}
                onChange={(e) => {
                    form.setData('description', e.target.value)
                    if (form.errors.description) {
                        form.clearErrors('description')
                    }
                }}
                error={form.errors.description}
                serverInvalid={!!form.errors.description}
                placeholder="Enter product description"
                rows={4}
            />

            {form.data.category_id && currentAvailableOptions.length > 0 && (
                <div className="space-y-4">
                    <Form.Field
                        name="options"
                        className="space-y-2"
                        serverInvalid={!!form.errors.option_value_ids}
                    >
                        <div className="flex items-baseline justify-between">
                            <Form.Label className="text-sm font-medium text-gray-700">
                                Options
                            </Form.Label>
                            {form.errors.option_value_ids && (
                                <Form.Message
                                    match={() => true}
                                    forceMatch={!!form.errors.option_value_ids}
                                    className="text-sm text-red-600"
                                >
                                    {form.errors.option_value_ids}
                                </Form.Message>
                            )}
                        </div>
                        <p className="text-xs text-gray-500">
                            Select options to enable for this product. Click on an option name to
                            expand and select specific values. Selected values will appear below the
                            option name.
                        </p>
                        <div className="border rounded-lg p-4 divide-y divide-gray-200 first:pt-0 last:pb-0">
                            {currentAvailableOptions.map((option) => {
                                const isOptionSelected = selectedOptionIds.includes(option.id)
                                const isExpanded = expandedOptions.has(option.id)
                                const hasValues = option.values.length > 0
                                const selectedValues = option.values.filter((v) =>
                                    selectedOptionValueIds.includes(v.id)
                                )

                                return (
                                    <div key={option.id} className="space-y-2 py-3">
                                        <div className="flex items-start space-x-2">
                                            <Checkbox
                                                id={`option-${option.id}`}
                                                checked={isOptionSelected}
                                                onCheckedChange={(checked) =>
                                                    handleOptionToggle(option.id, checked === true)
                                                }
                                                className="relative top-0.5"
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                            <div
                                                className="flex-1 cursor-pointer"
                                                onClick={() => {
                                                    if (isOptionSelected && hasValues) {
                                                        toggleOptionExpand(option.id)
                                                    }
                                                }}
                                            >
                                                <div className="text-sm font-medium text-gray-700">
                                                    {option.name}
                                                </div>
                                                {isOptionSelected && selectedValues.length > 0 && (
                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                        {selectedValues
                                                            .map((v) => v.name)
                                                            .join(', ')}
                                                    </p>
                                                )}
                                            </div>
                                            {isOptionSelected && hasValues && (
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        toggleOptionExpand(option.id)
                                                    }}
                                                    aria-label={isExpanded ? 'Collapse' : 'Expand'}
                                                    className="px-1.5"
                                                >
                                                    {isExpanded ? (
                                                        <ChevronDown className="h-4 w-4 text-gray-500" />
                                                    ) : (
                                                        <ChevronRight className="h-4 w-4 text-gray-500" />
                                                    )}
                                                </Button>
                                            )}
                                        </div>
                                        {isOptionSelected && hasValues && isExpanded && (
                                            <div className="ml-6 space-y-2 border-l-2 border-gray-200 pl-4">
                                                <p className="text-xs text-gray-500 mb-2">
                                                    Select available values:
                                                </p>
                                                {option.values.map((value) => (
                                                    <div
                                                        key={value.id}
                                                        className="flex items-center space-x-2"
                                                    >
                                                        <Checkbox
                                                            id={`value-${value.id}`}
                                                            checked={selectedOptionValueIds.includes(
                                                                value.id
                                                            )}
                                                            onCheckedChange={(checked) =>
                                                                handleOptionValueToggle(
                                                                    value.id,
                                                                    checked === true
                                                                )
                                                            }
                                                        />
                                                        <label
                                                            htmlFor={`value-${value.id}`}
                                                            className="text-sm text-gray-600 cursor-pointer flex items-center space-x-2"
                                                        >
                                                            <span>{value.name}</span>
                                                            {Number(value.price_adder) !== 0 && (
                                                                <span className="text-xs text-gray-500">
                                                                    (
                                                                    {Number(value.price_adder) > 0
                                                                        ? '+'
                                                                        : ''}
                                                                    $
                                                                    {Number(
                                                                        value.price_adder
                                                                    ).toFixed(2)}
                                                                    )
                                                                </span>
                                                            )}
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </Form.Field>
                </div>
            )}

            <div className="space-y-2">
                <Form.Field name="sku" className="space-y-2" serverInvalid={!!form.errors.sku}>
                    <Form.Label className="text-sm font-medium text-gray-700">SKU</Form.Label>
                    <Form.Control asChild>
                        <input
                            type="text"
                            value={form.data.sku}
                            onChange={(e) => {
                                form.setData('sku', e.target.value)
                                if (form.errors.sku) {
                                    form.clearErrors('sku')
                                }
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Auto-generated (e.g., TSHIRT-CREW-N-1)"
                        />
                    </Form.Control>
                    {form.errors.sku && (
                        <Form.Message
                            match={() => true}
                            forceMatch={!!form.errors.sku}
                            className="text-sm text-red-600"
                        >
                            {form.errors.sku}
                        </Form.Message>
                    )}
                </Form.Field>
                <p className="text-xs text-gray-500">
                    {selectedOptionIds.length > 0
                        ? 'Base SKU for this product. Variant SKUs (e.g., TSHIRT-CREW-N-1-SMAL-BLUE) will be generated when configuring the product with option values.'
                        : 'Base SKU will be auto-generated if left empty. You can customize it or leave blank for automatic generation.'}
                </p>
            </div>

            <div className="space-y-2">
                <Form.Field name="image" serverInvalid={!!form.errors.image} className="space-y-2">
                    <div className="flex items-baseline justify-between">
                        <Form.Label className="text-sm font-medium text-gray-700 data-[invalid]:text-red-600">
                            Image
                        </Form.Label>
                        {form.errors.image && (
                            <Form.Message
                                match={() => true}
                                forceMatch={!!form.errors.image}
                                className="text-sm text-red-600"
                            >
                                {form.errors.image}
                            </Form.Message>
                        )}
                    </div>
                    <div className="space-y-2">
                        <input
                            id="image"
                            name="image"
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                            onChange={handleImageChange}
                            className="hidden"
                        />
                        {imagePreview ? (
                            <div className="relative inline-block">
                                <div className="relative">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="h-48 w-48 object-cover rounded-lg border-2 border-gray-300"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none'
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            form.setData('image', null)
                                            setImagePreview(null)
                                            const input = document.getElementById(
                                                'image'
                                            ) as HTMLInputElement
                                            if (input) input.value = ''
                                        }}
                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors shadow-lg"
                                        title="Remove image"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-4 w-4"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </button>
                                </div>
                                <label
                                    htmlFor="image"
                                    className="mt-2 inline-block cursor-pointer text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                                >
                                    Change image
                                </label>
                            </div>
                        ) : (
                            <label
                                htmlFor="image"
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                                    isDragging
                                        ? 'border-indigo-500 bg-indigo-50'
                                        : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                                }`}
                            >
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <svg
                                        className="w-10 h-10 mb-3 text-gray-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                        />
                                    </svg>
                                    <p className="mb-2 text-sm text-gray-500">
                                        <span className="font-semibold">Click to upload</span> or
                                        drag and drop
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        PNG, JPG, GIF or WEBP (MAX. 10MB)
                                    </p>
                                </div>
                            </label>
                        )}
                    </div>
                </Form.Field>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="secondary" onClick={onClose}>
                    Cancel
                </Button>
                <Form.Submit asChild>
                    <Button type="submit" disabled={form.processing}>
                        {form.processing ? 'Saving...' : product ? 'Update' : 'Create'}
                    </Button>
                </Form.Submit>
            </div>
        </Form.Root>
    )
}
