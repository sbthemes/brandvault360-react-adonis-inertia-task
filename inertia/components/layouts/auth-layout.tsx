import * as React from 'react'
import { Card, CardContent } from '~/components/ui/card'
import Notification from '~/components/ui/notification'

interface AuthLayoutProps {
    children: React.ReactNode
    title?: string
    subtitle?: string
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
    return (
        <>
            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-md space-y-8">
                    {title && (
                        <div className="text-center">
                            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
                            {subtitle && <p className="mt-2 text-sm text-gray-600">{subtitle}</p>}
                        </div>
                    )}
                    <Card className="shadow-lg">
                        <CardContent className="p-8">{children}</CardContent>
                    </Card>
                </div>
            </div>
            <Notification />
        </>
    )
}
