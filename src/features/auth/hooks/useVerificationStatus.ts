import { useCallback, useEffect, useState } from 'react'
import { authApi } from '../api/auth.api'
import type { VerificationStatusResponse } from '../types'

export function useVerificationStatus() {
  const [status, setStatus] = useState<VerificationStatusResponse | null>(null)
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    setLoading(true)
    try {
      const result = await authApi.getVerificationStatus()
      setStatus(result)
    } catch {
      setStatus(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refetch()
  }, [refetch])

  return { status, loading, refetch }
}
