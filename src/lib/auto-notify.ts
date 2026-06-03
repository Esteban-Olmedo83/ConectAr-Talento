// Utility for the "auto-notify candidates" preference stored in localStorage.
// Mirrors the key structure used by NotificacionesTab in settings/page.tsx.

export const AUTO_NOTIFY_KEY = 'auto_notify_candidates'

function notifPrefsKey(userId: string | undefined): string {
  return userId ? `u_${userId}_notif_prefs` : 'ct_notif_prefs'
}

export function isAutoNotifyEnabled(userId: string | undefined): boolean {
  try {
    const raw = localStorage.getItem(notifPrefsKey(userId))
    if (!raw) return false
    const prefs = JSON.parse(raw) as Record<string, boolean>
    return !!prefs[AUTO_NOTIFY_KEY]
  } catch {
    return false
  }
}
