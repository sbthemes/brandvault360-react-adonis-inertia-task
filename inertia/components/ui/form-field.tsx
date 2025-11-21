import * as React from 'react'
import * as Label from '@radix-ui/react-label'
import Input from './input'
import PasswordInput from './password-input'
import { Alert, AlertDescription } from './alert'
import { cn } from '~/lib/utils'

interface FormFieldProps {
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
}

export default function FormField({
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
}: FormFieldProps) {
    const InputComponent = type === 'password' ? PasswordInput : Input

    const errorMessage = Array.isArray(error) ? error[0] : error

    return (
        <div className="space-y-2">
            <Label.Root
                htmlFor={name}
                className={cn('text-sm font-medium text-gray-700', showLabel ? 'block' : 'sr-only')}
            >
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </Label.Root>
            <InputComponent
                id={name}
                name={name}
                {...(type !== 'password' && { type })}
                value={value}
                onChange={onChange}
                error={error}
                required={required}
                placeholder={placeholder || `Enter your ${label.toLowerCase()}`}
                autoComplete={autoComplete}
                className="rounded-md"
            />
            {errorMessage && (
                <Alert variant="destructive" className="py-2">
                    <AlertDescription className="text-sm">{errorMessage}</AlertDescription>
                </Alert>
            )}
        </div>
    )
}
