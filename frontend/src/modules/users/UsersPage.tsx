import { type FormEvent, useEffect, useState } from 'react'
import {
  activateUser,
  createUser,
  deactivateUser,
  listUsers,
} from '../../shared/api/domain'
import { EmptyState } from '../../shared/ui/EmptyState'

type UserRow = {
  id: string
  name: string
  loginId: string
  role: string
  active: boolean
}

export function UsersPage() {
  const [items, setItems] = useState<UserRow[]>([])
  const [error, setError] = useState<string | null>(null)

  async function reload() {
    const res = await listUsers()
    setItems(res.items)
  }

  useEffect(() => {
    void reload().catch((e: Error) => setError(e.message))
  }, [])

  async function onCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    try {
      await createUser({
        name: String(fd.get('name')),
        loginId: String(fd.get('loginId')),
        password: String(fd.get('password')),
        role: String(fd.get('role')),
        email: String(fd.get('email') || '') || undefined,
      })
      form.reset()
      await reload()
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Users</h1>
      {error && (
        <div className="works__error" role="alert">
          {error}
        </div>
      )}
      <form onSubmit={onCreate} className="work-form__grid" style={{ marginBottom: 20 }}>
        <label>
          Name *
          <input name="name" required />
        </label>
        <label>
          Login ID *
          <input name="loginId" required />
        </label>
        <label>
          Password *
          <input name="password" type="password" required minLength={8} />
        </label>
        <label>
          Role *
          <select name="role" defaultValue="Viewer">
            <option value="Administrator">Administrator</option>
            <option value="DataEntryOperator">Data Entry Operator</option>
            <option value="Engineer">Engineer</option>
            <option value="Accounts">Accounts</option>
            <option value="Viewer">Viewer</option>
          </select>
        </label>
        <label>
          Email
          <input name="email" type="email" />
        </label>
        <div className="form-actions">
          <button type="submit" className="works__btn works__btn--primary">
            Create user
          </button>
        </div>
      </form>
      <div className="table-scroll">
      <table className="works__table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Login</th>
            <th>Role</th>
            <th>Active</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <EmptyState
              colSpan={5}
              title="No users yet"
              detail="Create the first user above."
            />
          ) : (
            items.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.loginId}</td>
                <td>{u.role}</td>
                <td>{u.active ? 'Yes' : 'No'}</td>
                <td>
                  {u.active ? (
                    <button
                      type="button"
                      className="works__btn"
                      onClick={() => void deactivateUser(u.id).then(reload)}
                    >
                      Deactivate
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="works__btn"
                      onClick={() => void activateUser(u.id).then(reload)}
                    >
                      Activate
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      </div>
    </div>
  )
}
