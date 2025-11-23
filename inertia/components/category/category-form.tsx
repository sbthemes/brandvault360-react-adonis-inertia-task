import * as React from 'react'
import { useForm, router } from '@inertiajs/react'
import FormField from '~/components/ui/form-field'
import Button from '~/components/ui/button'
import Input from '~/components/ui/input'
import * as Label from '@radix-ui/react-label'
import { Alert, AlertDescription } from '~/components/ui/alert'

interface CategoryFormProps {
    category?: {
        id: number
        name: string
        slug: string
        description: string | null
        image: string | null
    }
    onClose: () => void
}

export default function CategoryForm({ category, onClose }: CategoryFormProps) {
    const [autoGenerateSlug, setAutoGenerateSlug] = React.useState(!category)
    const [imagePreview, setImagePreview] = React.useState<string | null>(category?.image || null)
    const [isDragging, setIsDragging] = React.useState(false)

    const form = useForm({
        name: category?.name || '',
        slug: category?.slug || '',
        description: category?.description || '',
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (category) {
            const formData = new FormData()
            formData.append('name', form.data.name)
            formData.append('slug', form.data.slug)
            if (form.data.description) {
                formData.append('description', form.data.description)
            }
            if (form.data.image) {
                formData.append('image', form.data.image)
            }
            formData.append('_method', 'PUT')

            router.post(`/categories/${category.id}`, formData, {
                preserveScroll: true,
                forceFormData: true,
                onFinish: () => {
                    onClose()
                },
            })
        } else {
            form.post('/categories', {
                preserveScroll: true,
                forceFormData: true,
                onSuccess: () => {
                    onClose()
                },
            })
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
                label="Name"
                name="name"
                value={form.data.name}
                onChange={(e) => form.setData('name', e.target.value)}
                error={form.errors.name}
                required
                placeholder="Enter category name"
            />

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label.Root htmlFor="slug" className="text-sm font-medium text-gray-700">
                        Slug
                        <span className="text-red-500 ml-1">*</span>
                    </Label.Root>
                    <label className="flex items-center space-x-2 text-xs text-gray-500">
                        <input
                            type="checkbox"
                            checked={autoGenerateSlug}
                            onChange={(e) => setAutoGenerateSlug(e.target.checked)}
                            className="rounded border-gray-300"
                        />
                        <span>Auto-generate</span>
                    </label>
                </div>
                <Input
                    id="slug"
                    name="slug"
                    value={form.data.slug}
                    onChange={(e) => {
                        form.setData('slug', e.target.value)
                        setAutoGenerateSlug(false)
                    }}
                    error={form.errors.slug}
                    required
                    placeholder="Enter category slug"
                />
                {form.errors.slug && (
                    <Alert variant="destructive" className="py-2">
                        <AlertDescription className="text-sm">{form.errors.slug}</AlertDescription>
                    </Alert>
                )}
            </div>

            <div className="space-y-2">
                <Label.Root htmlFor="description" className="text-sm font-medium text-gray-700">
                    Description
                </Label.Root>
                <textarea
                    id="description"
                    name="description"
                    value={form.data.description}
                    onChange={(e) => form.setData('description', e.target.value)}
                    rows={4}
                    className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Enter category description"
                />
                {form.errors.description && (
                    <Alert variant="destructive" className="py-2">
                        <AlertDescription className="text-sm">
                            {form.errors.description}
                        </AlertDescription>
                    </Alert>
                )}
            </div>

            <div className="space-y-2">
                <Label.Root htmlFor="image" className="text-sm font-medium text-gray-700">
                    Image
                </Label.Root>
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
                                    <span className="font-semibold">Click to upload</span> or drag
                                    and drop
                                </p>
                                <p className="text-xs text-gray-500">
                                    PNG, JPG, GIF or WEBP (MAX. 10MB)
                                </p>
                            </div>
                        </label>
                    )}
                </div>
                {form.errors.image && (
                    <Alert variant="destructive" className="py-2">
                        <AlertDescription className="text-sm">{form.errors.image}</AlertDescription>
                    </Alert>
                )}
            </div>

            <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="secondary" onClick={onClose}>
                    Cancel
                </Button>
                <Button type="submit" disabled={form.processing}>
                    {form.processing ? 'Saving...' : category ? 'Update' : 'Create'}
                </Button>
            </div>
        </form>
    )
}
