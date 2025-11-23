/// <reference path="../../adonisrc.ts" />
/// <reference path="../../config/inertia.ts" />

import '../css/app.css'
import { hydrateRoot } from 'react-dom/client'
import { createInertiaApp } from '@inertiajs/react'
import { resolvePageComponent } from '@adonisjs/inertia/helpers'
import { Theme } from '@radix-ui/themes'
import '@radix-ui/themes/styles.css'

const appName = import.meta.env.VITE_APP_NAME || 'AdonisJS'

createInertiaApp({
    progress: { color: '#5468FF' },

    title: (title) => `${title} - ${appName}`,

    resolve: (name) => {
        return resolvePageComponent(`../pages/${name}.tsx`, import.meta.glob('../pages/**/*.tsx'))
    },

    setup({ el, App, props }) {
        hydrateRoot(
            el,
            <Theme>
                <App {...props} />
            </Theme>
        )
    },
})
