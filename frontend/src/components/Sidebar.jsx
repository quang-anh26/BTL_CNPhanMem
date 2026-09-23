import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Avatar from './Avatar'
import { conversationApi } from '../api/conversationApi'
import { userApi } from '../api/userApi'
import { friendApi } from '../api/friendApi'
import { useSocket } from '../context/SocketContext'
import { SearchIcon } from './Icons'

export function formatConversationTime(dateStr) {
  if (!dateStr) return ''

  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr

  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  if (isToday) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
  }

  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  if (d.toDateString() === yesterday.toDateString()) {
    return 'Hôm qua'
  }

  const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24))
  if (diffDays < 7) {
    const daysMap = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']
    return daysMap[d.getDay()]
  }

  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
}

export default function Sidebar({ activeConversationId }) {
  const { subscribe, connected } = useSocket()
  const navigate = useNavigate()

  const [conversations, setConversations] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [suggestedUsers, setSuggestedUsers] = useState([])
  const [groupOpen, setGroupOpen] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [groupMembers, setGroupMembers] = useState([])
  const [groupSaving, setGroupSaving] = useState(false)

  const loadConversations = () => {
    conversationApi
      .list()
      .then((res) => {
        const list = res.data || []
        setConversations(list)
        if (list.length === 0) {
          // Load suggestions if no conversations yet
          userApi
            .search('')
            .then((uRes) => setSuggestedUsers(uRes.data || []))
            .catch(() => {})
        }
      })
      .catch(() => {
        setConversations([])
      })
  }

  useEffect(() => {
    loadConversations()
  }, [])

  useEffect(() => {
    if (!connected) return
    const unsubs = conversations.map((c) =>
      subscribe(`/topic/conversation/${c.conversationId}`, () => loadConversations())
    )
    const unsubPresence = subscribe('/topic/presence', () => loadConversations())
    return () => {
      unsubs.forEach((u) => u())
      unsubPresence()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, conversations.length])

  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([])
      return
    }
    const timeout = setTimeout(() => {
      userApi
        .search(searchTerm)
        .then((res) => setSearchResults(res.data || []))
        .catch(() => setSearchResults([]))
    }, 300)
    return () => clearTimeout(timeout)
  }, [searchTerm])

  const openPrivateChat = async (otherUserId) => {
    try {
      const { data } = await conversationApi.getOrCreatePrivate(otherUserId)
      setSearchTerm('')
      setSearchResults([])
      loadConversations()
      navigate(`/chat/${data.conversationId}`)
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể mở cuộc trò chuyện')
    }
  }

  const sendFriendRequest = async (receiverId) => {
    try {
      await friendApi.send(receiverId)
      alert('Đã gửi lời mời kết bạn')
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể gửi lời mời')
    }
  }

  const toggleGroupMember = (user) => {
    setGroupMembers((current) =>
      current.some((member) => member.userId === user.userId)
        ? current.filter((member) => member.userId !== user.userId)
        : [...current, user]
    )
  }

  const createGroup = async (event) => {
    event.preventDefault()
    if (!groupName.trim() || groupMembers.length === 0) return
    setGroupSaving(true)
    try {
      const { data } = await conversationApi.createGroup({
        name: groupName.trim(),
        memberIds: groupMembers.map((member) => member.userId),
      })
      setGroupOpen(false)
      setGroupName('')
      setGroupMembers([])
      setSearchTerm('')
      setSearchResults([])
      loadConversations()
      navigate(`/chat/${data.conversationId}`)
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể tạo nhóm')
    } finally {
      setGroupSaving(false)
    }
  }

  return (
    <div className="sidebar">
      {/* Search Input Bar with Create Group Button */}
      <div className="search-bar-container">
        <div className="search-input-wrapper">
          <input
            type="text"
            className="search-input"
            placeholder="Tìm kiếm bạn bè, tin nhắn..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="search-icon-btn">
            <SearchIcon size={16} color="#8392a5" />
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
          <button
            type="button"
            className="icon-btn"
            style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 4, color: 'var(--accent)', padding: '2px 8px' }}
            onClick={() => setGroupOpen((v) => !v)}
            title="Tạo nhóm chat mới"
          >
            <span>＋ Tạo nhóm</span>
          </button>
        </div>
      </div>

      {/* Group Create Modal / Panel toggle if open */}
      {groupOpen && (
        <div className="group-create-panel">
          <div className="group-create-title">
            <strong>Tạo nhóm mới</strong>
            <button className="icon-btn" onClick={() => setGroupOpen(false)} title="Đóng">
              ✕
            </button>
          </div>
          <form onSubmit={createGroup}>
            <input
              className="group-name-input"
              value={groupName}
              onChange={(event) => setGroupName(event.target.value)}
              placeholder="Tên nhóm"
              required
            />
            <div className="group-selected-list">
              {groupMembers.map((member) => (
                <button
                  type="button"
                  key={member.userId}
                  onClick={() => toggleGroupMember(member)}
                >
                  {member.displayName} ×
                </button>
              ))}
              {groupMembers.length === 0 && <span>Chọn ít nhất một người</span>}
            </div>
            <input
              className="group-name-input"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Tìm người để thêm vào nhóm..."
            />
            {searchResults.map((user) => {
              const selected = groupMembers.some((member) => member.userId === user.userId)
              return (
                <button
                  type="button"
                  key={user.userId}
                  className={`group-user-result ${selected ? 'selected' : ''}`}
                  onClick={() => toggleGroupMember(user)}
                >
                  <Avatar src={user.avatar} name={user.displayName} size={32} />
                  <span>
                    {user.displayName}
                    <small>@{user.username}</small>
                  </span>
                  <span>{selected ? '✓' : '+'}</span>
                </button>
              )
            })}
            <button
              className="group-submit-btn"
              type="submit"
              disabled={groupSaving || !groupName.trim() || groupMembers.length === 0}
            >
              {groupSaving ? 'Đang tạo...' : 'Tạo nhóm'}
            </button>
          </form>
        </div>
      )}

      {/* Search results overlay/panel */}
      {searchResults.length > 0 && (
        <div className="search-results-panel">
          <div className="search-results-title">Kết quả tìm kiếm</div>
          {searchResults.map((u) => (
            <div key={u.userId} className="conversation-item search-item">
              <Avatar src={u.avatar} name={u.displayName} size={42} />
              <div className="conv-meta" onClick={() => openPrivateChat(u.userId)}>
                <div className="conv-name">{u.displayName}</div>
                <div className="conv-last">@{u.username}</div>
              </div>
              <button
                className="icon-btn"
                onClick={() => sendFriendRequest(u.userId)}
                title="Gửi lời mời kết bạn"
              >
                ➕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Real Conversation List */}
      <div className="conversation-list">
        {conversations.length === 0 ? (
          <div className="sidebar-empty-state" style={{ padding: '20px 14px', textAlign: 'center' }}>
            <p style={{ fontSize: 13, marginBottom: 8, color: 'var(--text-secondary)' }}>
              Chưa có cuộc trò chuyện nào
            </p>

            {/* Suggested users list (Alice, etc.) */}
            {suggestedUsers.length > 0 && (
              <div style={{ marginTop: 14, textAlign: 'left' }}>
                <div style={{ fontSize: 11.5, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase' }}>
                  Gợi ý liên hệ
                </div>
                {suggestedUsers.map((u) => (
                  <div
                    key={u.userId}
                    className="conversation-item"
                    style={{ padding: '8px 6px' }}
                    onClick={() => openPrivateChat(u.userId)}
                  >
                    <Avatar src={u.avatar} name={u.displayName} size={38} />
                    <div className="conv-meta">
                      <div className="conv-name" style={{ fontSize: 13.5 }}>{u.displayName}</div>
                      <div className="conv-last" style={{ fontSize: 11.5 }}>@{u.username}</div>
                    </div>
                    <button
                      type="button"
                      style={{
                        padding: '4px 10px',
                        background: 'var(--accent)',
                        color: '#fff',
                        borderRadius: 6,
                        fontSize: 11.5,
                        fontWeight: 600,
                      }}
                    >
                      Chat
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          conversations.map((c) => {
            const isActive = String(c.conversationId) === String(activeConversationId)

            return (
              <div
                key={c.conversationId}
                className={`conversation-item ${isActive ? 'active' : ''}`}
                onClick={() => navigate(`/chat/${c.conversationId}`)}
              >
                <div className="avatar-wrapper">
                  <Avatar src={c.avatar} name={c.name} size={46} />
                  {c.type === 'PRIVATE' && c.otherUserOnline && (
                    <span className="online-indicator-dot" />
                  )}
                </div>

                <div className="conv-meta">
                  <div className="conv-top-row">
                    <span className="conv-name">{c.name || 'Cuộc trò chuyện'}</span>
                    <span className={`conv-time ${c.unreadCount > 0 ? 'unread' : ''}`}>
                      {formatConversationTime(c.lastMessageAt)}
                    </span>
                  </div>
                  <div className="conv-bottom-row">
                    <span className="conv-last">{c.lastMessage || 'Chưa có tin nhắn'}</span>
                    {c.unreadCount > 0 && (
                      <span className="unread-badge">{c.unreadCount}</span>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
