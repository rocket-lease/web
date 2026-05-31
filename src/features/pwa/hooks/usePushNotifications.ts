import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'
import { apiEndpoints } from '@rocket-lease/contracts'

type PermissionState = 'unsupported' | 'needs-install' | 'denied' | 'prompt' | 'granted'

function isIos() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in navigator && (navigator as { standalone?: boolean }).standalone === true)
  )
}

function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(b64)
  const buffer = new ArrayBuffer(raw.length)
  const view = new Uint8Array(buffer)
  for (let i = 0; i < raw.length; i++) view[i] = raw.charCodeAt(i)
  return view
}

function detectPermissionState(): PermissionState {
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
    return 'unsupported'
  }
  if (isIos() && !isStandalone()) {
    return 'needs-install'
  }
  if (Notification.permission === 'denied') return 'denied'
  if (Notification.permission === 'granted') return 'granted'
  return 'prompt'
}

export function usePushNotifications() {
  const [permissionState, setPermissionState] = useState<PermissionState>(detectPermissionState)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (permissionState !== 'granted') return
    navigator.serviceWorker.ready.then(reg =>
      reg.pushManager.getSubscription().then(sub => setIsSubscribed(sub !== null)),
    )
  }, [permissionState])

  const subscribe = useCallback(async () => {
    if (permissionState === 'unsupported' || permissionState === 'needs-install') return
    setIsLoading(true)
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setPermissionState(permission === 'denied' ? 'denied' : 'prompt')
        return
      }
      setPermissionState('granted')

      const { publicKey } = await apiClient.get<{ publicKey: string }>(
        apiEndpoints.pushSubscriptions.vapidKey,
      )

      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      })

      const json = sub.toJSON() as {
        endpoint: string
        expirationTime: number | null
        keys: { auth: string; p256dh: string }
      }

      await apiClient.post(apiEndpoints.pushSubscriptions.register, json)
      setIsSubscribed(true)
    } catch (err) {
      const msg = err instanceof Error ? err.message : JSON.stringify(err)
      toast.error(`Push error: ${msg}`)
    } finally {
      setIsLoading(false)
    }
  }, [permissionState])

  const unsubscribe = useCallback(async () => {
    setIsLoading(true)
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (!sub) return
      await apiClient.deleteWithBody(apiEndpoints.pushSubscriptions.unregister, {
        endpoint: sub.endpoint,
      })
      await sub.unsubscribe()
      setIsSubscribed(false)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { permissionState, isSubscribed, isLoading, subscribe, unsubscribe }
}
