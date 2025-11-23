import { Head, useForm } from '@inertiajs/react'
import * as React from 'react'
import * as Form from '@radix-ui/react-form'
import AuthLayout from '~/components/layouts/auth-layout'
import RadixFormField from '~/components/ui/radix-form-field'
import Button from '~/components/ui/button'

export default function AdminLogin() {
    const form = useForm({
        email: '',
        password: '',
    })

    const handleSubmit = React.useCallback(
        (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault()
            form.post('/login')
        },
        [form]
    )

    const handleClearServerErrors = React.useCallback(() => {
        form.clearErrors()
    }, [form])

    return (
        <>
            <Head title="Admin Login" />
            <AuthLayout title="Welcome to Admin Panel">
                <Form.Root
                    onSubmit={handleSubmit}
                    onClearServerErrors={handleClearServerErrors}
                    className="space-y-6"
                >
                    <RadixFormField
                        label="Email address"
                        name="email"
                        type="email"
                        value={form.data.email}
                        onChange={(e) => form.setData('email', e.target.value)}
                        error={form.errors.email}
                        serverInvalid={!!form.errors.email}
                        required
                        autoComplete="email"
                    />

                    <RadixFormField
                        label="Password"
                        name="password"
                        type="password"
                        value={form.data.password}
                        onChange={(e) => form.setData('password', e.target.value)}
                        error={form.errors.password}
                        serverInvalid={!!form.errors.password}
                        required
                        autoComplete="current-password"
                    />

                    <Form.Submit asChild>
                        <Button type="submit" disabled={form.processing} className="w-full">
                            {form.processing ? 'Signing in...' : 'Sign in'}
                        </Button>
                    </Form.Submit>
                </Form.Root>
            </AuthLayout>
        </>
    )
}
