import * as React from 'react'
import { useForm } from '@inertiajs/react'
import * as Form from '@radix-ui/react-form'
import RadixFormField from '~/components/ui/radix-form-field'
import Button from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'
import type { OptionFormData } from '~/types/option'
import type { CategoryListItem } from '~/types/category'
import { Plus, Trash2 } from 'lucide-react'

interface OptionFormProps {
    option?: OptionFormData
    categories: CategoryListItem[]
    onClose: () => void
}

export default function OptionForm({ option, categories, onClose }: OptionFormProps) {
    const form = useForm<{
        name: string
        category_ids: number[]
        values: Array<{ name: string; price_adder: number | '' }>
    }>({
        name: option?.name || '',
        category_ids: option?.category_ids || [],
        values: option?.values?.map((v) => ({
            name: v.name,
            price_adder: v.price_adder ?? '',
        })) || [{ name: '', price_adder: '' }],
    })

    const handleCategoryToggle = (categoryId: number) => {
        const currentIds = form.data.category_ids || []
        if (currentIds.includes(categoryId)) {
            form.setData(
                'category_ids',
                currentIds.filter((id) => id !== categoryId)
            )
        } else {
            form.setData('category_ids', [...currentIds, categoryId])
        }
    }

    const addValue = () => {
        form.setData('values', [...form.data.values, { name: '', price_adder: '' }])
    }

    const removeValue = (index: number) => {
        const newValues = form.data.values.filter((_, i) => i !== index)
        if (newValues.length === 0) {
            form.setData('values', [{ name: '', price_adder: '' }])
        } else {
            form.setData('values', newValues)
        }
    }

    const updateValue = (index: number, field: 'name' | 'price_adder', value: string | number) => {
        const newValues = [...form.data.values]
        if (field === 'price_adder') {
            const stringValue = String(value)
            newValues[index] = {
                ...newValues[index],
                price_adder: stringValue === '' ? '' : parseFloat(stringValue) || 0,
            }
        } else {
            newValues[index] = {
                ...newValues[index],
                name: String(value),
            }
        }
        form.setData('values', newValues)
    }

    const handleSubmit = React.useCallback(
        (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault()

            const filteredValues = form.data.values
                .filter((v) => v.name.trim() !== '')
                .map((v) => ({
                    name: v.name,
                    price_adder: v.price_adder === '' ? 0 : Number(v.price_adder),
                }))

            const originalValues = form.data.values
            form.setData('values', filteredValues as any)

            if (option?.id) {
                form.post(`/admin/options/${option.id}`, {
                    preserveScroll: true,
                    preserveState: true,
                    onSuccess: () => {
                        onClose()
                    },
                    onError: () => {
                        form.setData('values', originalValues)
                    },
                })
            } else {
                form.post('/admin/options', {
                    preserveScroll: true,
                    preserveState: true,
                    onSuccess: () => {
                        onClose()
                    },
                    onError: () => {
                        form.setData('values', originalValues)
                    },
                })
            }
        },
        [form, option, onClose]
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
                label="Option Name"
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
                placeholder="Enter option name (e.g., Size, Color)"
            />

            <div className="space-y-2">
                <Form.Field
                    name="category_ids"
                    serverInvalid={!!form.errors.category_ids}
                    className="space-y-2"
                >
                    <Form.Label className="text-sm font-medium text-gray-700 data-[invalid]:text-red-600">
                        Categories
                    </Form.Label>
                    <div className="border rounded-lg p-4 max-h-48 overflow-y-auto space-y-2">
                        {categories.length === 0 ? (
                            <p className="text-sm text-gray-500">No categories available</p>
                        ) : (
                            categories.map((category) => (
                                <label
                                    key={category.id}
                                    className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                                >
                                    <Checkbox
                                        checked={
                                            form.data.category_ids?.includes(category.id) || false
                                        }
                                        onCheckedChange={() => handleCategoryToggle(category.id)}
                                    />
                                    <span className="text-sm text-gray-700">{category.name}</span>
                                </label>
                            ))
                        )}
                    </div>
                    {form.errors.category_ids && (
                        <Form.Message
                            match={() => true}
                            forceMatch={!!form.errors.category_ids}
                            className="text-sm text-red-600"
                        >
                            {Array.isArray(form.errors.category_ids)
                                ? form.errors.category_ids[0]
                                : form.errors.category_ids}
                        </Form.Message>
                    )}
                </Form.Field>
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Option Values</label>
                    <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={addValue}
                        className="flex items-center space-x-1"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Add Value</span>
                    </Button>
                </div>

                <div className="space-y-3 border rounded-lg p-4">
                    {form.data.values.map((value, index) => (
                        <div key={index} className="grid grid-cols-11 gap-2 items-end">
                            <div className="col-span-5">
                                <RadixFormField
                                    label="Value Name"
                                    name={`values.${index}.name`}
                                    type="text"
                                    value={value.name}
                                    onChange={(e) => {
                                        updateValue(index, 'name', e.target.value)
                                        if (form.errors[`values.${index}.name`]) {
                                            form.clearErrors(`values.${index}.name`)
                                        }
                                    }}
                                    error={
                                        form.errors[`values.${index}.name`] as string | undefined
                                    }
                                    serverInvalid={!!form.errors[`values.${index}.name`]}
                                    placeholder="e.g., S, M, L"
                                />
                            </div>
                            <div className="col-span-5">
                                <RadixFormField
                                    label="Price Adder"
                                    name={`values.${index}.price_adder`}
                                    type="number"
                                    value={value.price_adder === '' ? '' : value.price_adder}
                                    onChange={(e) => {
                                        updateValue(index, 'price_adder', e.target.value)
                                        if (form.errors[`values.${index}.price_adder`]) {
                                            form.clearErrors(`values.${index}.price_adder`)
                                        }
                                    }}
                                    error={
                                        form.errors[`values.${index}.price_adder`] as
                                            | string
                                            | undefined
                                    }
                                    serverInvalid={!!form.errors[`values.${index}.price_adder`]}
                                    placeholder="0.00"
                                    step="0.01"
                                    min="-999999"
                                />
                            </div>
                            <div className="">
                                <Button
                                    type="button"
                                    variant="danger"
                                    onClick={() => removeValue(index)}
                                    disabled={form.data.values.length === 1}
                                    className="w-full"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
                {form.errors.values && (
                    <Form.Field
                        name="values"
                        serverInvalid={!!form.errors.values}
                        className="space-y-2"
                    >
                        <Form.Message
                            match={() => true}
                            forceMatch={!!form.errors.values}
                            className="text-sm text-red-600"
                        >
                            {Array.isArray(form.errors.values)
                                ? form.errors.values[0]
                                : form.errors.values}
                        </Form.Message>
                    </Form.Field>
                )}
            </div>

            <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="secondary" onClick={onClose}>
                    Cancel
                </Button>
                <Form.Submit asChild>
                    <Button type="submit" disabled={form.processing}>
                        {form.processing ? 'Saving...' : option ? 'Update' : 'Create'}
                    </Button>
                </Form.Submit>
            </div>
        </Form.Root>
    )
}
