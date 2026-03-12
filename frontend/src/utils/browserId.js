const KEY = 'orderly_browser_id'

/**
 * Returns a stable UUID for this browser, creating one if it doesn't exist yet.
 * Stored in localStorage so it persists across page reloads / sessions on the
 * same device, while remaining unique per browser/device.
 */
export function getBrowserId() {
  let id = localStorage.getItem(KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(KEY, id)
  }
  return id
}
