'use client'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const INACTIVITY_THRESHOLD_MS = 45 * 60 * 1000 

export function InactivityReloader() {
  useEffect(() => {
    let lastActivity = Date.now()
    let hiddenAt = 0

    const onActivity = () => { lastActivity = Date.now() }
    document.addEventListener('mousemove', onActivity, { passive: true })
    document.addEventListener('keydown', onActivity, { passive: true })
    document.addEventListener('click', onActivity, { passive: true })
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        hiddenAt = Date.now()
      } else if (hiddenAt > 0) {
        const awayMs = Date.now() - hiddenAt
        hiddenAt = 0
        if (awayMs > INACTIVITY_THRESHOLD_MS) { window.location.reload(); return }
        
        supabase.auth.getSession().then(({ data }) => {
          if (!data.session) window.location.reload()
        })
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    const handleFocus = () => {
      if (Date.now() - lastActivity > INACTIVITY_THRESHOLD_MS) window.location.reload()
    }
    window.addEventListener('focus', handleFocus)

    const interval = setInterval(() => {
      if (Date.now() - lastActivity > INACTIVITY_THRESHOLD_MS) window.location.reload()
    }, 60_000) 

    return () => {
      document.removeEventListener('mousemove', onActivity)
      document.removeEventListener('keydown', onActivity)
      document.removeEventListener('click', onActivity)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
      clearInterval(interval)
    }
  }, [])

  return null
}
