import * as React from 'react'
import * as Form from '@radix-ui/react-form'
import Input from './input'
import PasswordToggleField from './password-toggle-field'
import { cn } from '~/lib/utils'

interface RadixFormFieldProps {
    id?: string
    label?: string
    name: string
    type?: string
    value: string | number
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
    error?: string | string[]
    required?: boolean
    placeholder?: string
    autoComplete?: string
    showLabel?: boolean
    serverInvalid?: boolean
    rows?: number
    step?: string
    min?: string
    labelComponent?: React.ReactNode
}

export default function RadixFormField({
    id,
    label,
    name,
    type = 'text',
    value,
    onChange,
    error,
    required = false,
    placeholder,
    autoComplete,
    showLabel = true,
    serverInvalid = false,
    rows,
    step,
    min,
    labelComponent,
}: RadixFormFieldProps) {
    const InputComponent = type === 'password' ? PasswordToggleField : Input
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

    const isTextarea = type === 'textarea'

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
            {isTextarea ? (
                <Form.Control asChild>
                    <textarea
                        name={name}
                        value={value}
                        onChange={onChange}
                        required={required}
                        placeholder={placeholder || `Enter your ${label.toLowerCase()}`}
                        rows={rows || 4}
                        className={cn(
                            'flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-50',
                            errorMessage && 'border-red-300 focus:border-red-500 focus:ring-red-500'
                        )}
                    />
                </Form.Control>
            ) : type === 'password' ? (
                <PasswordToggleField
                    name={name}
                    value={String(value)}
                    onChange={onChange}
                    required={required}
                    placeholder={placeholder || `Enter your ${label.toLowerCase()}`}
                    autoComplete={autoComplete}
                    className="rounded-md"
                    error={error}
                />
            ) : (
                <Form.Control asChild>
                    <InputComponent
                        id={id}
                        type={type}
                        name={name}
                        value={value}
                        onChange={onChange}
                        required={required}
                        placeholder={placeholder || `Enter your ${label?.toLowerCase() || ''}`}
                        autoComplete={autoComplete}
                        className="rounded-md"
                        step={step}
                        min={min}
                    />
                </Form.Control>
            )}
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
