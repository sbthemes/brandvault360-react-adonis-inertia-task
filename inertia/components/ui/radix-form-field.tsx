import * as React from 'react'
import * as Form from '@radix-ui/react-form'
import Input from './input'
import PasswordToggleField from './password-toggle-field'
import { cn } from '~/lib/utils'

interface RadixFormFieldProps {
    label: string
    name: string
    type?: string
    value: string
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    error?: string | string[]
    required?: boolean
    placeholder?: string
    autoComplete?: string
    showLabel?: boolean
    serverInvalid?: boolean
}

export default function RadixFormField({
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

    return (
        <Form.Field name={name} serverInvalid={serverInvalid} className="space-y-2">
            <div className="flex items-baseline justify-between">
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
            </div>
            {type === 'password' ? (
                <PasswordToggleField
                    name={name}
                    value={value}
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
                        type={type}
                        value={value}
                        onChange={onChange}
                        required={required}
                        placeholder={placeholder || `Enter your ${label.toLowerCase()}`}
                        autoComplete={autoComplete}
                        className="rounded-md"
                    />
                </Form.Control>
            )}
        </Form.Field>
    )
}
