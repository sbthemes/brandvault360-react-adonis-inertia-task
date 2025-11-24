import * as React from 'react'
import * as Form from '@radix-ui/react-form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'
import { cn } from '~/lib/utils'

interface SelectOption {
    id: number | string
    name: string
}

interface RadixFormFieldSelectProps {
    id?: string
    label?: string
    name: string
    value: string | number
    onValueChange: (value: string) => void
    options: SelectOption[]
    error?: string | string[]
    required?: boolean
    placeholder?: string
    showLabel?: boolean
    serverInvalid?: boolean
    labelComponent?: React.ReactNode
}

export default function RadixFormFieldSelect({
    id,
    label,
    name,
    value,
    onValueChange,
    options,
    error,
    required = false,
    placeholder,
    showLabel = true,
    serverInvalid = false,
    labelComponent,
}: RadixFormFieldSelectProps) {
    const errorMessage = Array.isArray(error) ? error[0] : error

    const getMatchType = React.useCallback(() => {
        if (!errorMessage) return undefined
        const lowerError = errorMessage.toLowerCase()
        if (lowerError.includes('required') || lowerError.includes('missing')) {
            return 'valueMissing'
        }
        if (
            lowerError.includes('valid') ||
            lowerError.includes('format') ||
            lowerError.includes('email')
        ) {
            return 'typeMismatch'
        }
        return 'customError'
    }, [errorMessage])

    const matchType = getMatchType()

    return (
        <Form.Field name={name} serverInvalid={serverInvalid} className="space-y-2">
            <div className="flex items-center justify-between">
                {label && (
                    <Form.Label
                        className={cn(
                            'text-sm font-medium text-gray-700',
                            showLabel ? 'block' : 'sr-only',
                            'data-[invalid]:text-red-600'
                        )}
                    >
                        {label}
                        {required && <span className="text-red-500 ml-1">*</span>}
                    </Form.Label>
                )}
                {labelComponent}
            </div>
            <Select value={String(value)} onValueChange={onValueChange}>
                <SelectTrigger
                    id={id || name}
                    className={cn(
                        errorMessage && 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    )}
                >
                    <SelectValue
                        placeholder={placeholder || `Select ${label?.toLowerCase() || 'an option'}`}
                    />
                </SelectTrigger>
                <SelectContent>
                    {options.map((option) => (
                        <SelectItem key={option.id} value={String(option.id)}>
                            {option.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {errorMessage && matchType === 'valueMissing' && (
                <Form.Message
                    match="valueMissing"
                    forceMatch={serverInvalid}
                    className="text-sm text-red-600"
                >
                    {errorMessage}
                </Form.Message>
            )}
            {errorMessage && matchType === 'typeMismatch' && (
                <Form.Message
                    match="typeMismatch"
                    forceMatch={serverInvalid}
                    className="text-sm text-red-600"
                >
                    {errorMessage}
                </Form.Message>
            )}
            {errorMessage && matchType === 'customError' && (
                <Form.Message
                    match={() => true}
                    forceMatch={!!errorMessage}
                    className="text-sm text-red-600"
                >
                    {errorMessage}
                </Form.Message>
            )}
        </Form.Field>
    )
}
