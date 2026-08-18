type AuthFailureListener = () => void

const listeners = new Set<AuthFailureListener>()

export function subscribeAuthFailure(listener: AuthFailureListener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** Login 401 is a bad password. /auth/me and refresh 401s are handled by bootstrap. */
export function emitAuthFailure(path: string) {
  if (
    path.startsWith('/auth/login') ||
    path.startsWith('/auth/me') ||
    path.startsWith('/auth/refresh')
  ) {
    return
  }
  listeners.forEach((listener) => listener())
}
