import React, { useEffect, useState } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import Avatar from './Avatar'
import { useAuth } from '../context/AuthContext'
import { friendApi } from '../api/friendApi'
import SettingsModal from './SettingsModal'
import {
  MessengerLogo,
  ChatIcon,
  FriendsIcon,
  SettingsIcon,
  ChevronUp,
  ChevronDown,
} from './Icons'

export default function NavRail() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [pendingCount, setPendingCount] = useState(0)
  const [settingsOpen, setSettingsOpen] = useState(false)

  useEffect(() => {
    friendApi
      .received()
      .then((res) => setPendingCount(res.data ? res.data.length : 0))
      .catch(() => {})
  }, [])

  const displayName = user?.displayName || user?.username || 'Tài khoản'
  const isOnline = user?.isOnline !== false

  return (
    <>
      <div className="nav-rail">
        {/* Brand Header */}
        <div className="nav-rail-brand" onClick={() => navigate('/')}>
          <MessengerLogo size={32} />
          <span className="brand-title">Messenger</span>
        </div>

        {/* Navigation Links */}
        <div className="nav-rail-menu">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `nav-item ${isActive && !location.pathname.startsWith('/friends') && !location.pathname.startsWith('/profile') ? 'active' : ''}`
            }
            title="Trò chuyện"
          >
            <span className="nav-icon">
              <ChatIcon size={20} />
            </span>
            <span className="nav-label">Trò chuyện</span>
          </NavLink>

          <NavLink
            to="/friends"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            title="Bạn bè"
          >
            <span className="nav-icon">
              <FriendsIcon size={20} />
            </span>
            <span className="nav-label">Bạn bè</span>
            {pendingCount > 0 && <span className="nav-badge">{pendingCount}</span>}
          </NavLink>

          {/* Cài đặt item - opens the settings modal */}
          <button
            type="button"
            className="nav-item"
            onClick={() => setSettingsOpen(true)}
            title="Cài đặt"
          >
            <span className="nav-icon">
              <SettingsIcon size={20} />
            </span>
            <span className="nav-label">Cài đặt</span>
          </button>
        </div>

        {/* Footer: Real user profile & status - clicking opens Settings modal */}
        <div className="nav-rail-footer">
          {/* Status indicator row */}
          <div
            className="online-status-row"
            onClick={() => setSettingsOpen(true)}
            title="Trạng thái hoạt động & Cài đặt"
          >
            <div className="status-indicator-left">
              <span className={`status-dot ${isOnline ? 'online' : 'offline'}`} />
              <span className="status-text">{isOnline ? 'Đang online' : 'Hoạt động'}</span>
            </div>
            <ChevronUp size={14} color="#94a3b8" />
          </div>

          {/* User Profile Card: Clicking on the user's name opens Settings Modal */}
          <div
            className="user-profile-row"
            onClick={() => setSettingsOpen(true)}
            title="Cài đặt tài khoản"
          >
            <Avatar src={user?.avatar} name={displayName} size={36} />
            <span className="user-display-name">{displayName}</span>
            <ChevronDown size={14} color="#94a3b8" />
          </div>
        </div>
      </div>

      {/* Settings Modal Component matching the user's uploaded mockup */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </>
  )
}
