import * as React from 'react'
import Sidebar from './sidebar'
import { DashboardIcon, CubeIcon, LayersIcon, GearIcon } from '@radix-ui/react-icons'

interface AdminLayoutProps {
    children: React.ReactNode
}

const sidebarItems = [
    { label: 'Dashboard', href: '/', icon: <DashboardIcon className="h-5 w-5" /> },
    { label: 'Products', href: '/products', icon: <CubeIcon className="h-5 w-5" /> },
    { label: 'Categories', href: '/categories', icon: <LayersIcon className="h-5 w-5" /> },
    { label: 'Options', href: '/options', icon: <GearIcon className="h-5 w-5" /> },
]

export default function AdminLayout({ children }: AdminLayoutProps) {
    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar items={sidebarItems} />
            <main className="flex-1 overflow-y-auto">
                <div className="p-8">{children}</div>
            </main>
        </div>
    )
}
