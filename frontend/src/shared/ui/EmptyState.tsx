export function EmptyState({
  title,
  detail,
  colSpan,
}: {
  title: string
  detail?: string
  colSpan?: number
}) {
  const body = (
    <div className="works__empty">
      <p className="works__empty-title">{title}</p>
      {detail ? <p className="works__empty-detail">{detail}</p> : null}
    </div>
  )
  if (colSpan) {
    return (
      <tr>
        <td colSpan={colSpan}>{body}</td>
      </tr>
    )
  }
  return body
}
