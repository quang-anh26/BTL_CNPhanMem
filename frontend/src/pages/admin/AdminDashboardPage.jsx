import React, { useEffect, useState } from 'react'
import { adminApi } from '../../api/adminApi'
import { useAuth } from '../../context/AuthContext'

export default function AdminDashboardPage() {
  const { logout } = useAuth()
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [q, setQ] = useState('')

  const loadUsers = (keyword) => adminApi.users(keyword).then((res) => setUsers(res.data))

  useEffect(() => {
    adminApi.dashboard().then((res) => setStats(res.data))
    loadUsers('')
  }, [])

  const toggleLock = async (u) => {
    if (u.status === 'LOCKED') await adminApi.unlock(u.userId)
    else await adminApi.lock(u.userId)
    loadUsers(q)
  }

  return (
    <div className="admin-shell">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2>Admin Dashboard</h2>
        <button className="icon-btn" onClick={logout}>Đăng xuất</button>
      </div>

      {stats && (
        <div className="admin-stats">
          <div className="stat-card"><div className="num">{stats.totalUsers}</div><div className="label">Tổng người dùng</div></div>
          <div className="stat-card"><div className="num">{stats.onlineUsers}</div><div className="label">Đang online</div></div>
          <div className="stat-card"><div className="num">{stats.lockedUsers}</div><div className="label">Tài khoản bị khóa</div></div>
          <div className="stat-card"><div className="num">{stats.messagesToday}</div><div className="label">Tin nhắn hôm nay</div></div>
        </div>
      )}

      <div style={{ marginBottom: 12 }}>
        <input
          placeholder="Tìm theo username / tên..."
          value={q}
          onChange={(e) => { setQ(e.target.value); loadUsers(e.target.value) }}
          style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', width: 280 }}
        />
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th><th>Username</th><th>Tên hiển thị</th><th>Vai trò</th><th>Trạng thái</th><th>Online</th><th></th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.userId}>
              <td>{u.userId}</td>
              <td>{u.username}</td>
              <td>{u.displayName}</td>
              <td>{u.role}</td>
              <td>
                <span className={u.status === 'LOCKED' ? 'badge-locked' : 'badge-active'}>{u.status}</span>
              </td>
              <td>{u.online ? '🟢' : '⚪'}</td>
              <td>
                <button className="icon-btn" onClick={() => toggleLock(u)}>
                  {u.status === 'LOCKED' ? 'Mở khóa' : 'Khóa'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
