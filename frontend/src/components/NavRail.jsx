import React, { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import Avatar from './Avatar'
import { useAuth } from '../context/AuthContext'
import { friendApi } from '../api/friendApi'
import SettingsModal from './SettingsModal'
import {
  MessengerLogo,
  ChatIcon,
  FriendsIcon,
  ArchiveIcon,
  SettingsIcon,
  ChevronLeft,
  ChevronRight,
} from './Icons'

export default function NavRail() {
  const { user } = useAuth()
  const location = useLocation()
  const [pendingCount, setPendingCount] = useState(0)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [archiveSelected, setArchiveSelected] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('kapatalk-nav-collapsed') === 'true'
  })

  useEffect(() => {
    friendApi
      .received()
      .then((res) => setPendingCount(res.data ? res.data.length : 0))
      .catch(() => {})
  }, [])

  const displayName = user?.displayName || user?.username || 'Tài khoản'
  const isOnline = user?.isOnline !== false

  const toggleCollapsed = (event) => {
    event.stopPropagation()
    setIsCollapsed((current) => {
      const next = !current
      localStorage.setItem('kapatalk-nav-collapsed', String(next))
      return next
    })
  }

  return (
    <>
      <div className={`nav-rail ${isCollapsed ? 'collapsed' : ''}`}>
        {/* Brand Header */}
        <div className="nav-rail-brand">
          <MessengerLogo size={32} />
          <span className="brand-title">Kapatalk</span>
        </div>

        {/* Navigation Links */}
        <div className="nav-rail-menu">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `nav-item ${isActive && !location.pathname.startsWith('/friends') && !location.pathname.startsWith('/profile') ? 'active' : ''}`
            }
            title="Trò chuyện"
            onClick={() => {
              setArchiveSelected(false)
              window.dispatchEvent(new Event('kapatalk-show-active'))
            }}
          >
            <span className="nav-icon">
              <ChatIcon size={20} />
            </span>
            <span className="nav-label">Trò chuyện</span>
          </NavLink>

          <NavLink
            to="/friends"
            className={({ isActive }) => `nav-item ${isActive && !archiveSelected ? 'active' : ''}`}
            title="Bạn bè"
            onClick={() => setArchiveSelected(false)}
          >
            <span className="nav-icon">
              <FriendsIcon size={20} />
            </span>
            <span className="nav-label">Bạn bè</span>
            {pendingCount > 0 && <span className="nav-badge">{pendingCount}</span>}
          </NavLink>

          <button
            type="button"
            className={`nav-item nav-archive-button ${archiveSelected ? 'active' : ''}`}
            onClick={() => {
              setArchiveSelected(true)
              window.dispatchEvent(new Event('kapatalk-show-archived'))
            }}
            title="Đã lưu trữ"
          >
            <span className="nav-icon">
              <ArchiveIcon size={20} />
            </span>
            <span className="nav-label">Đã lưu trữ</span>
          </button>

        </div>

        {/* Footer: Real user profile & status - clicking opens Settings modal */}
        <div className="nav-rail-footer">
          {/* Status indicator row */}
          <div
            className="online-status-row"
            title="Trạng thái hoạt động"
          >
            <div className="status-indicator-left">
              <span className={`status-dot ${isOnline ? 'online' : 'offline'}`} />
              <span className="status-text">{isOnline ? 'Đang online' : 'Hoạt động'}</span>
            </div>
          </div>

          {/* User Profile Card: Clicking on the user's name opens Settings Modal */}
          <div
            className="user-profile-row"
            onClick={() => setUserMenuOpen((current) => !current)}
            title="Cài đặt tài khoản"
          >
            <Avatar src={user?.avatar} name={displayName} size={36} />
            <span className="user-display-name">{displayName}</span>
            {userMenuOpen && (
              <div className="user-options" onClick={(event) => event.stopPropagation()}>
                <button
                  type="button"
                  className="user-option"
                  onClick={() => {
                    setSettingsOpen(true)
                    setUserMenuOpen(false)
                  }}
                >
                  <SettingsIcon size={18} />
                  <span>Cài đặt</span>
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            className="nav-collapse-button"
            onClick={toggleCollapsed}
            aria-label={isCollapsed ? 'Mở thanh điều hướng' : 'Thu gọn thanh điều hướng'}
            title={isCollapsed ? 'Mở thanh điều hướng' : 'Thu gọn thanh điều hướng'}
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            <span className="nav-label">{isCollapsed ? 'Mở rộng' : 'Thu gọn'}</span>
          </button>
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
