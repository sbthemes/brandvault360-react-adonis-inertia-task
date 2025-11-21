import * as React from 'react'
import { cn } from '~/lib/utils'
import { EyeNoneIcon, EyeOpenIcon } from '@radix-ui/react-icons'

export interface PasswordInputProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
    error?: string | string[]
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
    ({ className, error, ...props }, ref) => {
        const [showPassword, setShowPassword] = React.useState(false)
        const errorMessage = Array.isArray(error) ? error[0] : error

        const handleToggle = React.useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault()
            e.stopPropagation()
            setShowPassword((prev) => !prev)
        }, [])

        const { type: _, ...inputProps } = props as any

        return (
            <div className="relative">
                <input
                    type={showPassword ? 'text' : 'password'}
                    className={cn(
                        'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 pr-10 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-50',
                        errorMessage && 'border-red-300 focus:border-red-500 focus:ring-red-500',
                        className
                    )}
                    ref={ref}
                    aria-invalid={errorMessage ? 'true' : 'false'}
                    aria-describedby={
                        errorMessage ? `${inputProps.id || inputProps.name}-error` : undefined
                    }
                    {...inputProps}
                />
                <button
                    type="button"
                    onClick={handleToggle}
                    onMouseDown={(e) => {
                        e.preventDefault()
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none z-10 cursor-pointer p-1"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                    {showPassword ? (
                        <EyeNoneIcon className="h-5 w-5 pointer-events-none" />
                    ) : (
                        <EyeOpenIcon className="h-5 w-5 pointer-events-none" />
                    )}
                </button>
            </div>
        )
    }
)
PasswordInput.displayName = 'PasswordInput'

export default PasswordInput
