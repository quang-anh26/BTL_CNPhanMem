import React, { useEffect, useState } from 'react'
import Avatar from '../components/Avatar'
import { userApi } from '../api/userApi'
import { useAuth } from '../context/AuthContext'

export default function ProfilePage() {
  const { user, setUser } = useAuth()
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [avatar, setAvatar] = useState('')
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    userApi.me().then((res) => {
      setDisplayName(res.data.displayName || '')
      setBio(res.data.bio || '')
      setAvatar(res.data.avatar || '')
    })
  }, [])

  const saveProfile = async (e) => {
    e.preventDefault()
    const { data } = await userApi.updateProfile({ displayName, bio, avatar })
    setUser((prev) => ({ ...prev, displayName: data.displayName, avatar: data.avatar }))
    setMessage('Đã lưu hồ sơ')
    setTimeout(() => setMessage(''), 2000)
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const { data } = await userApi.uploadAvatar(file)
    setAvatar(data.url)
  }

  const changePassword = async (e) => {
    e.preventDefault()
    try {
      await userApi.changePassword({ oldPassword, newPassword })
      setMessage('Đã đổi mật khẩu')
      setOldPassword('')
      setNewPassword('')
    } catch (err) {
      setMessage(err.response?.data?.message || 'Đổi mật khẩu thất bại')
    }
    setTimeout(() => setMessage(''), 2500)
  }

  return (
    <div className="chat-area">
      <div className="chat-header"><strong>Hồ sơ của tôi</strong></div>
      <div style={{ padding: 24, maxWidth: 420, overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <Avatar src={avatar} name={displayName} size={72} />
          <label style={{ fontSize: 13, color: '#0084ff', cursor: 'pointer' }}>
            Đổi ảnh đại diện
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} />
          </label>
        </div>

        <form onSubmit={saveProfile}>
          <div className="field">
            <label>Tên hiển thị</label>
            <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          </div>
          <div className="field">
            <label>Giới thiệu</label>
            <input value={bio} onChange={(e) => setBio(e.target.value)} />
          </div>
          <button className="primary" type="submit">Lưu hồ sơ</button>
        </form>

        <hr style={{ margin: '24px 0' }} />

        <form onSubmit={changePassword}>
          <div className="field">
            <label>Mật khẩu cũ</label>
            <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required />
          </div>
          <div className="field">
            <label>Mật khẩu mới</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} />
          </div>
          <button className="primary" type="submit">Đổi mật khẩu</button>
        </form>

        {message && <p style={{ color: '#1e8e3e', marginTop: 12 }}>{message}</p>}
      </div>
    </div>
  )
}
