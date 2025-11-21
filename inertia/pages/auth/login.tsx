import { Head, useForm } from '@inertiajs/react'
import * as React from 'react'
import AuthLayout from '~/components/layouts/auth-layout'
import FormField from '~/components/ui/form-field'
import Button from '~/components/ui/button'

export default function AdminLogin() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        post('/login')
    }

    return (
        <>
            <Head title="Admin Login" />
            <AuthLayout title="Welcome to Admin Panel">
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <FormField
                        label="Email address"
                        name="email"
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        error={errors.email}
                        required
                        autoComplete="email"
                    />

                    <FormField
                        label="Password"
                        name="password"
                        type="password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        error={errors.password}
                        required
                        autoComplete="current-password"
                    />

                    <Button type="submit" disabled={processing} className="w-full">
                        {processing ? 'Signing in...' : 'Sign in'}
                    </Button>
                </form>
            </AuthLayout>
        </>
    )
}
