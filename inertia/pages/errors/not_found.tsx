import { Head } from '@inertiajs/react'
import Button from '~/components/ui/button'

interface Props {
    error?: {
        status: number
        message: string
    }
}

export default function NotFound({ error }: Props) {
    return (
        <>
            <Head title="404 - Page Not Found" />
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="text-center">
                        <h1 className="text-9xl font-bold text-gray-900">404</h1>
                        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                            Page Not Found
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            {error?.message || 'The page you are looking for does not exist.'}
                        </p>
                        <div className="mt-8 flex justify-center space-x-4">
                            <Button asLink href="/admin">
                                Go Home
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
