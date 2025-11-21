import * as React from 'react'
import { Link, router, usePage } from '@inertiajs/react'
import Button from '~/components/ui/button'
import { cn } from '~/lib/utils'

interface SidebarItem {
    label: string
    href: string
    icon?: React.ReactNode
}

interface SidebarProps {
    items: SidebarItem[]
}

export default function Sidebar({ items }: SidebarProps) {
    const user = usePage().props.user as { email: string; fullName: string }
    const currentUrl = usePage().url
    const handleLogout = () => {
        router.post('/logout')
    }

    const isActive = (href: string) => {
        if (href === '/') {
            return currentUrl === '/'
        }
        return currentUrl.startsWith(href)
    }

    return (
        <div className="flex h-screen w-64 flex-col bg-white border-r border-gray-200">
            <div className="flex h-16 items-center border-b border-gray-200 px-6">
                <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
            </div>

            <nav className="flex-1 space-y-1 px-3 py-4">
                {items.map((item) => {
                    const active = isActive(item.href)
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                active
                                    ? 'bg-indigo-50 text-indigo-600'
                                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                            )}
                        >
                            {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                            {item.label}
                        </Link>
                    )
                })}
            </nav>

            <div className="border-t border-gray-200 p-4">
                <div className="mb-4 space-y-2 px-3">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {user.fullName}
                    </div>
                    <div className="text-sm text-gray-700">{user.email}</div>
                </div>
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleLogout}
                    className="w-full hover:bg-red-400 hover:border-red-400 hover:text-white"
                >
                    Logout
                </Button>
            </div>
        </div>
    )
}
