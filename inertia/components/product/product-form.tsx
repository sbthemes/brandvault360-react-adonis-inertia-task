import * as React from 'react'
import { useForm } from '@inertiajs/react'
import * as Form from '@radix-ui/react-form'
import RadixFormField from '~/components/ui/radix-form-field'
import RadixFormFieldSelect from '~/components/ui/radix-form-field-select'
import Button from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'
import type { ProductFormData } from '~/types/product'
import type { CategoryListItem } from '~/types/category'

interface ProductFormProps {
    product?: ProductFormData
    categories: CategoryListItem[]
    onClose: () => void
}

export default function ProductForm({ product, categories, onClose }: ProductFormProps) {
    const [autoGenerateSlug, setAutoGenerateSlug] = React.useState(!product)
    const [imagePreview, setImagePreview] = React.useState<string | null>(product?.image || null)
    const [isDragging, setIsDragging] = React.useState(false)

    const form = useForm({
        name: product?.name || '',
        slug: product?.slug || '',
        category_id: product?.category_id || '',
        description: product?.description || '',
        base_price: product?.base_price || 0,
        image: null as File | null,
    })

    React.useEffect(() => {
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

    const handleSubmit = React.useCallback(
        (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault()

            if (product) {
                form.post(`/products/${product.id}`, {
                    preserveScroll: true,
                    forceFormData: true,
                    onSuccess: () => {
                        onClose()
                    },
                })
            } else {
                form.post('/products', {
                    preserveScroll: true,
                    forceFormData: true,
                    onSuccess: () => {
                        onClose()
                    },
                })
            }
        },
        [form, product, onClose]
    )

    const handleClearServerErrors = React.useCallback(() => {
        form.clearErrors()
    }, [form])

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
