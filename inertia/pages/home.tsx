import { Head, Link } from '@inertiajs/react'
import Button from '~/components/ui/button'

export default function Home() {
    return (
        <>
            <Head title="Welcome" />
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex flex-col items-center justify-center px-4">
                <div className="max-w-2xl text-center space-y-8">
                    <div className="space-y-4">
                        <h1 className="text-5xl font-bold text-gray-900">Welcome to Start Kit</h1>
                        <p className="text-xl text-gray-600">
                            Your e-commerce product configurator is ready to use
                        </p>
                    </div>

                    <div className="pt-8">
                        <Button asChild size="lg" className="text-lg px-8 py-6">
                            <Link href="/admin">Go to Admin Panel</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </>
    )
}
