import * as React from 'react'
import { unstable_PasswordToggleField as PasswordToggleField } from 'radix-ui'
import { EyeClosedIcon, EyeOpenIcon } from '@radix-ui/react-icons'
import { cn } from '~/lib/utils'

export interface PasswordToggleFieldProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
    error?: string | string[]
}

const PasswordToggleFieldComponent = React.forwardRef<HTMLInputElement, PasswordToggleFieldProps>(
    ({ className, error, autoComplete, ...props }, ref) => {
        const errorMessage = Array.isArray(error) ? error[0] : error
        const validAutoComplete =
            autoComplete === 'new-password' ? 'new-password' : 'current-password'

        return (
            <PasswordToggleField.Root>
                <div className="relative">
                    <PasswordToggleField.Input
                        ref={ref}
                        autoComplete={validAutoComplete}
                        className={cn(
                            'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 pr-10 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-50',
                            errorMessage &&
                                'border-red-300 focus:border-red-500 focus:ring-red-500',
                            className
                        )}
                        aria-invalid={errorMessage ? 'true' : 'false'}
                        aria-describedby={
                            errorMessage ? `${props.id || props.name}-error` : undefined
                        }
                        {...props}
                    />
                    <PasswordToggleField.Toggle className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none z-10 cursor-pointer p-1">
                        <PasswordToggleField.Icon
                            visible={<EyeOpenIcon className="h-5 w-5" />}
                            hidden={<EyeClosedIcon className="h-5 w-5" />}
                        />
                    </PasswordToggleField.Toggle>
                </div>
            </PasswordToggleField.Root>
        )
    }
)
PasswordToggleFieldComponent.displayName = 'PasswordToggleField'

export default PasswordToggleFieldComponent
