import * as React from 'react'
import { Link } from '@inertiajs/react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '~/lib/utils'

const buttonVariants = cva(
    'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
    {
        variants: {
            variant: {
                primary:
                    'bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-indigo-500',
                secondary:
                    'bg-white text-gray-900 border border-gray-300 hover:bg-gray-50 focus-visible:ring-indigo-500',
                danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500',
            },
            size: {
                sm: 'h-8 px-3 text-xs',
                md: 'h-10 px-4 py-2',
                lg: 'h-12 px-6 text-base',
            },
        },
        defaultVariants: {
            variant: 'primary',
            size: 'md',
        },
    }
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    asChild?: boolean
    asLink?: boolean
    href?: string
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        { className, variant, size, asChild = false, asLink = false, href, children, ...props },
        ref
    ) => {
        const buttonClasses = cn(buttonVariants({ variant, size, className }))
        const Comp = asChild ? Slot : 'button'

        if (asLink && href) {
            return (
                <Link href={href} className={buttonClasses}>
                    {children}
                </Link>
            )
        }

        return (
            <Comp
                type={asChild ? undefined : 'button'}
                className={buttonClasses}
                ref={ref}
                {...props}
            >
                {children}
            </Comp>
        )
    }
)
Button.displayName = 'Button'

export default Button
