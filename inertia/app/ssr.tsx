import ReactDOMServer from 'react-dom/server'
import { createInertiaApp } from '@inertiajs/react'
import { Theme } from '@radix-ui/themes'

export default function render(page: any) {
    return createInertiaApp({
        page,
        render: ReactDOMServer.renderToString,
        resolve: (name) => {
            const pages = import.meta.glob('../pages/**/*.tsx', { eager: true })
            return pages[`../pages/${name}.tsx`]
        },
        setup: ({ App, props }) => (
            <Theme>
                <App {...props} />
            </Theme>
        ),
    })
}
