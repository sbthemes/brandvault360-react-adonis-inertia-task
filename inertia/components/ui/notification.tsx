import * as React from 'react'
import { cn } from '~/lib/utils'

import { usePage } from '@inertiajs/react'

interface NotificationData {
    type: 'success' | 'error'
    message: string
}

export interface NotificationProps {
    notification?: NotificationData
}

export default function Notification() {
    const notification = usePage().props.notification as NotificationData | undefined

    const [isVisible, setIsVisible] = React.useState(!!notification)
    const [isExiting, setIsExiting] = React.useState(false)

    React.useEffect(() => {
        if (notification) {
            setIsVisible(true)
            setIsExiting(false)

            const timer = setTimeout(() => {
                setIsExiting(true)
                setTimeout(() => setIsVisible(false), 300)
            }, 5000)

            return () => clearTimeout(timer)
        } else {
            setIsVisible(false)
        }
    }, [notification])

    if (!notification || !isVisible) {
        return null
    }

    const styles: Record<NotificationData['type'], string> = {
        success: 'bg-green-500 text-white',
        error: 'bg-red-500 text-white',
    }

    return (
        <div
            className={cn(
                'fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300',
                isExiting ? 'opacity-0 translate-y-[-20px]' : 'opacity-100 translate-y-0'
            )}
        >
            <div
                className={cn(
                    'flex items-center justify-between gap-3 px-4 py-3 rounded-lg shadow-lg min-w-[320px] max-w-md',
                    styles[notification.type]
                )}
            >
                <p className="flex-1 text-sm font-medium">{notification.message}</p>
                <button
                    onClick={() => {
                        setIsExiting(true)
                        setTimeout(() => setIsVisible(false), 300)
                    }}
                    className="flex-shrink-0 text-current opacity-70 hover:opacity-100 transition-opacity"
                >
                    ×
                </button>
            </div>
        </div>
    )
}
