export function PlaceholderPage({ title }: { title: string }) {
  return (
    <div>
      <h1 style={{ marginTop: 0 }}>{title}</h1>
      <p style={{ color: 'var(--cwms-on-surface-variant)' }}>
        This module is scheduled for a later milestone. Shell navigation is
        available now for role-aware routing.
      </p>
    </div>
  )
}
