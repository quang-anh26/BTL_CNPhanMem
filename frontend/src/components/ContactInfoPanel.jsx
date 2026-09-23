import React, { useEffect, useState } from 'react'
import Avatar from './Avatar'
import { blockApi } from '../api/blockApi'
import {
  UserProfileIcon,
  SearchIcon,
  BellIcon,
  ChevronRight,
} from './Icons'

function formatLastSeen(dateStr, now) {
  if (!dateStr) return 'chưa rõ thời gian'
  const elapsedMinutes = Math.max(0, Math.floor((now - new Date(dateStr).getTime()) / 60000))
  if (elapsedMinutes < 1) return 'vừa xong'
  if (elapsedMinutes < 60) return `${elapsedMinutes} phút trước`
  const elapsedHours = Math.floor(elapsedMinutes / 60)
  if (elapsedHours < 24) return `${elapsedHours} giờ trước`
  return `${Math.floor(elapsedHours / 24)} ngày trước`
}

export default function ContactInfoPanel({ conversationInfo, otherUserId, images = [], onClose }) {
  const [blocked, setBlocked] = useState(false)
  const [muted, setMuted] = useState(false)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60000)
    return () => window.clearInterval(timer)
  }, [])

  if (!conversationInfo) return null

  const displayName = conversationInfo?.name || 'Cuộc trò chuyện'
  const isOnline = conversationInfo?.otherUserOnline
  const isGroup = conversationInfo?.type === 'GROUP'

  const toggleBlock = async () => {
    if (!otherUserId) return
    try {
      if (blocked) {
        await blockApi.unblock(otherUserId)
        setBlocked(false)
      } else {
        if (!window.confirm(`Chặn người dùng ${displayName}? Họ sẽ không thể nhắn tin cho bạn.`)) return
        await blockApi.block(otherUserId)
        setBlocked(true)
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể thực hiện thao tác')
    }
  }

  const previewMedia = (images || []).slice(0, 4)
  const remainingCount = images.length > 4 ? images.length - 3 : 0

  return (
    <div className="info-panel">
      {/* Profile Header */}
      <div className="info-profile-section">
        <div className="info-avatar-wrapper">
          <Avatar
            src={conversationInfo.avatar}
            name={displayName}
            size={82}
          />
        </div>

        <div className="info-profile-name">{displayName}</div>

        <div className="info-status-row">
          <span className={`status-dot ${isGroup ? 'online' : (isOnline ? 'online' : 'offline')}`} />
          <span className="status-label">
            {isGroup ? 'Nhóm chat' : (isOnline ? 'Đang hoạt động' : `Hoạt động · ${formatLastSeen(conversationInfo.otherUserLastSeenAt, now)}`)}
          </span>
        </div>
      </div>

      {/* Action list */}
      <div className="info-actions-list">
        <button className="info-action-item" type="button" title="Xem thông tin">
          <span className="info-action-icon">
            <UserProfileIcon size={18} color="#94a3b8" />
          </span>
          <span className="info-action-text">Xem thông tin</span>
        </button>

        <button className="info-action-item" type="button" title="Tìm kiếm trong cuộc trò chuyện">
          <span className="info-action-icon">
            <SearchIcon size={18} color="#94a3b8" />
          </span>
          <span className="info-action-text">Tìm kiếm trong cuộc trò chuyện</span>
        </button>

        <button
          className="info-action-item"
          type="button"
          onClick={() => setMuted((v) => !v)}
          title="Tắt thông báo"
        >
          <span className="info-action-icon">
            <BellIcon size={18} color={muted ? '#0084ff' : '#94a3b8'} />
          </span>
          <span className="info-action-text">
            {muted ? 'Bật thông báo' : 'Tắt thông báo'}
          </span>
        </button>
      </div>

      {/* File, ảnh, liên kết Section - Real images only */}
      <div className="info-media-section">
        <div className="info-section-header">
          <span className="info-section-title">File, ảnh, liên kết</span>
          <ChevronRight size={16} color="#64748b" />
        </div>

        {previewMedia.length > 0 ? (
          <div className="info-media-grid">
            {previewMedia.map((url, idx) => {
              const isLastSlot = idx === 3 && remainingCount > 0
              return (
                <div key={idx} className="info-media-thumb">
                  <img src={url} alt={`media-${idx}`} />
                  {isLastSlot && (
                    <div className="info-media-overlay">
                      <span>+{remainingCount}</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div style={{ fontSize: 12, color: 'var(--text-muted)', padding: '6px 0' }}>
            Chưa có ảnh hoặc tệp nào được gửi
          </div>
        )}
      </div>

      {/* Thông tin Section */}
      <div className="info-details-section">
        <div className="info-section-header">
          <span className="info-section-title">Thông tin</span>
        </div>

        <div className="info-kv-row">
          <span className="kv-label">Tên</span>
          <span className="kv-value">{displayName}</span>
        </div>

        <div className="info-kv-row">
          <span className="kv-label">Phân loại</span>
          <span className="kv-value">{isGroup ? 'Nhóm chat' : 'Trò chuyện cá nhân'}</span>
        </div>

        <div className="info-kv-row">
          <span className="kv-label">Trạng thái</span>
          <span className="kv-value">{isGroup ? 'Hoạt động' : (isOnline ? 'Đang online' : `Hoạt động · ${formatLastSeen(conversationInfo.otherUserLastSeenAt, now)}`)}</span>
        </div>

        {!isGroup && otherUserId && (
          <div className="info-block-btn-row">
            <button className="info-block-btn" onClick={toggleBlock}>
              {blocked ? 'Bỏ chặn người dùng' : 'Chặn người dùng'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
