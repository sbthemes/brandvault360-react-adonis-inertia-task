import { Head } from '@inertiajs/react'
import AdminLayout from '~/components/layouts/admin-layout'

export default function AdminDashboard() {
    return (
        <>
            <Head title="Admin Dashboard" />
            <AdminLayout>
                <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        Welcome to Admin Dashboard
                    </h2>
                </div>
            </AdminLayout>
        </>
    )
}
