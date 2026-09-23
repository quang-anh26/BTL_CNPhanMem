import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import Avatar from '../components/Avatar'
import ContactInfoPanel from '../components/ContactInfoPanel'
import { messageApi } from '../api/messageApi'
import { conversationApi } from '../api/conversationApi'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import {
  VideoCallIcon,
  PhoneCallIcon,
  MoreVerticalIcon,
  PaperclipIcon,
  EmojiIcon,
  SendPaperPlane,
  DoubleCheckIcon,
} from '../components/Icons'

function formatMsgTime(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
}

function formatLastSeen(dateStr, now) {
  if (!dateStr) return 'chưa rõ thời gian'
  const elapsedMinutes = Math.max(0, Math.floor((now - new Date(dateStr).getTime()) / 60000))
  if (elapsedMinutes < 1) return 'vừa xong'
  if (elapsedMinutes < 60) return `${elapsedMinutes} phút trước`
  const elapsedHours = Math.floor(elapsedMinutes / 60)
  if (elapsedHours < 24) return `${elapsedHours} giờ trước`
  const elapsedDays = Math.floor(elapsedHours / 24)
  return `${elapsedDays} ngày trước`
}

export default function ChatWindow() {
  const { conversationId } = useParams()
  const { user } = useAuth()
  const { subscribe, publish, connected, startCall } = useSocket()

  const [conversationInfo, setConversationInfo] = useState(null)
  const [messages, setMessages] = useState([])
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [text, setText] = useState('')
  const [replyTo, setReplyTo] = useState(null)
  const [typingUsers, setTypingUsers] = useState({})
  const [uploading, setUploading] = useState(false)
  const [showInfoPanel, setShowInfoPanel] = useState(true)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [now, setNow] = useState(() => Date.now())

  const bottomRef = useRef(null)
  const messagesContainerRef = useRef(null)
  const typingTimeoutRef = useRef(null)
  const fileInputRef = useRef(null)

  const quickEmojis = ['👍', '❤️', '😂', '😮', '😢', '👏', '🔥', '🎉']

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60000)
    return () => window.clearInterval(timer)
  }, [])

  // Load real conversation metadata
  useEffect(() => {
    if (!conversationId) return
    conversationApi
      .list()
      .then((res) => {
        const found = res.data?.find((c) => String(c.conversationId) === String(conversationId))
        setConversationInfo(found || null)
      })
      .catch(() => {})

    setShowInfoPanel(true)
  }, [conversationId])

  // Load real messages history
  useEffect(() => {
    if (!conversationId) return
    setMessages([])
    setPage(0)
    setHasMore(false)
    setLoadingHistory(true)

    messageApi
      .history(conversationId, 0)
      .then((res) => {
        setMessages(res.data || [])
        setHasMore((res.data || []).length === 20)
        setLoadingHistory(false)
        setTimeout(() => bottomRef.current?.scrollIntoView(), 50)
      })
      .catch(() => {
        setMessages([])
        setLoadingHistory(false)
      })
  }, [conversationId])

  const loadMore = useCallback(() => {
    if (!conversationId) return
    const nextPage = page + 1
    const container = messagesContainerRef.current
    const prevHeight = container?.scrollHeight || 0

    messageApi.history(conversationId, nextPage).then((res) => {
      const older = res.data || []
      setMessages((prev) => [...older, ...prev])
      setHasMore(older.length === 20)
      setPage(nextPage)
      requestAnimationFrame(() => {
        if (container) container.scrollTop = container.scrollHeight - prevHeight
      })
    })
  }, [conversationId, page])

  // Realtime subscriptions
  useEffect(() => {
    if (!connected || !conversationId) return

    const unsubMessages = subscribe(`/topic/conversation/${conversationId}`, (incoming) => {
      setMessages((prev) => {
        const idx = prev.findIndex((m) => m.messageId === incoming.messageId)
        if (idx >= 0) {
          const copy = [...prev]
          copy[idx] = incoming
          return copy
        }
        return [...prev, incoming]
      })
      if (String(incoming.senderId) !== String(user?.userId)) {
        publish('/app/chat.seen', { conversationId: Number(conversationId) })
      }
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    })

    const unsubTyping = subscribe(`/topic/conversation/${conversationId}/typing`, (event) => {
      if (String(event.userId) === String(user?.userId)) return
      setTypingUsers((prev) => {
        const copy = { ...prev }
        if (event.typing) copy[event.userId] = event.username
        else delete copy[event.userId]
        return copy
      })
    })

    const unsubSeen = subscribe(`/topic/conversation/${conversationId}/seen`, () => {
      setMessages((prev) =>
        prev.map((m) =>
          String(m.senderId) === String(user?.userId) ? { ...m, deliveryStatus: 'SEEN' } : m
        )
      )
    })

    const unsubPresence = subscribe('/topic/presence', () => {
      conversationApi.list().then((res) => {
        const found = res.data?.find((c) => String(c.conversationId) === String(conversationId))
        setConversationInfo(found || null)
      }).catch(() => {})
    })

    publish('/app/chat.seen', { conversationId: Number(conversationId) })

    return () => {
      unsubMessages()
      unsubTyping()
      unsubSeen()
      unsubPresence()
    }
  }, [connected, conversationId, user?.userId])

  const handleSend = () => {
    if (!text.trim() || !conversationId) return

    publish('/app/chat.send', {
      conversationId: Number(conversationId),
      content: text.trim(),
      messageType: 'TEXT',
      replyToMessageId: replyTo?.messageId || null,
    })
    setText('')
    setReplyTo(null)
    setShowEmojiPicker(false)
    stopTyping()
  }

  const handleTyping = (value) => {
    setText(value)
    if (connected && conversationId) {
      publish('/app/chat.typing', { conversationId: Number(conversationId), typing: true })
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = setTimeout(stopTyping, 2000)
    }
  }

  const stopTyping = () => {
    if (connected && conversationId) {
      publish('/app/chat.typing', { conversationId: Number(conversationId), typing: false })
    }
  }

  const handleRecall = (messageId) => {
    if (!window.confirm('Thu hồi tin nhắn này?')) return
    if (connected && conversationId) {
      publish('/app/chat.recall', { conversationId: Number(conversationId), messageId })
    }
  }

  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !conversationId) return
    setUploading(true)
    try {
      const { data } = await messageApi.upload(file)
      const isImage = file.type.startsWith('image/')
      publish('/app/chat.send', {
        conversationId: Number(conversationId),
        content: data.url,
        messageType: isImage ? 'IMAGE' : 'FILE',
      })
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể tải tệp lên')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const otherUserId = useMemo(
    () => messages.find((m) => String(m.senderId) !== String(user?.userId))?.senderId ?? null,
    [messages, user?.userId]
  )

  const sharedImages = useMemo(() => {
    return messages
      .filter((m) => m.messageType === 'IMAGE' && !m.deleted)
      .map((m) => m.content)
      .reverse()
  }, [messages])

  const headerAvatar = conversationInfo?.avatar
  const headerName = conversationInfo?.name || 'Cuộc trò chuyện'
  const isOnline = conversationInfo?.otherUserOnline

  return (
    <div className="chat-layout-wrapper">
      <div className="chat-area">
        {/* Chat Header */}
        <div className="chat-header">
          <div className="chat-header-left" onClick={() => setShowInfoPanel((v) => !v)}>
            <div className="avatar-wrapper">
              <Avatar src={headerAvatar} name={headerName} size={42} />
              {conversationInfo?.type === 'PRIVATE' && isOnline && (
                <span className="online-indicator-dot" />
              )}
            </div>
            <div className="chat-header-info">
              <div className="chat-header-name">{headerName}</div>
              <div className="chat-header-status">
                {conversationInfo?.type === 'GROUP'
                  ? 'Nhóm chat'
                  : isOnline
                  ? 'Đang online'
                  : `Hoạt động · ${formatLastSeen(conversationInfo?.otherUserLastSeenAt, now)}`}
              </div>
            </div>
          </div>

          <div className="chat-header-actions">
            <button className="header-action-btn" title="Gọi video" onClick={() => startCall(conversationInfo, 'video')} disabled={conversationInfo?.type === 'GROUP'}>
              <VideoCallIcon size={20} color="#8da2b5" />
            </button>
            <button className="header-action-btn" title="Gọi thoại" onClick={() => startCall(conversationInfo, 'audio')} disabled={conversationInfo?.type === 'GROUP'}>
              <PhoneCallIcon size={19} color="#8da2b5" />
            </button>
            <button
              className="header-action-btn"
              onClick={() => setShowInfoPanel((v) => !v)}
              title="Thông tin cuộc trò chuyện"
            >
              <MoreVerticalIcon size={19} color="#8da2b5" />
            </button>
          </div>
        </div>

        {/* Message Stream */}
        <div className="chat-messages" ref={messagesContainerRef}>
          {hasMore && !loadingHistory && (
            <div className="load-more" onClick={loadMore}>
              ⌃ Tải thêm tin nhắn cũ hơn
            </div>
          )}

          {loadingHistory && (
            <div className="empty-state" style={{ height: 80 }}>
              Đang tải tin nhắn...
            </div>
          )}

          {!loadingHistory && messages.length === 0 && (
            <div className="empty-state" style={{ height: 180, flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 32 }}>👋</div>
              <div style={{ color: 'var(--text-secondary)' }}>Chưa có tin nhắn nào. Hãy gửi lời chào đầu tiên!</div>
            </div>
          )}

          {/* Date Separator */}
          {messages.length > 0 && (
            <div className="date-separator">
              <span>Hôm nay</span>
            </div>
          )}

          {messages.map((m) => {
            const mine = String(m.senderId) === String(user?.userId)
            const timeDisplay = formatMsgTime(m.createdAt)

            return (
              <div
                key={m.messageId}
                className={`msg-group-row ${mine ? 'mine' : 'theirs'}`}
              >
                {!mine && (
                  <div className="msg-sender-avatar">
                    <Avatar
                      src={m.senderAvatar || headerAvatar}
                      name={m.senderDisplayName || headerName}
                      size={32}
                    />
                  </div>
                )}

                <div className="msg-bubble-container">
                  <div className={`msg-bubble ${mine ? 'bubble-mine' : 'bubble-theirs'} ${m.deleted ? 'deleted' : ''}`}>
                    {m.replyToMessageId && !m.deleted && (
                      <div className="msg-reply-quote">
                        ↩ {m.replyToContentPreview || 'tin nhắn'}
                      </div>
                    )}

                    {m.deleted ? (
                      <span className="msg-deleted-text">Tin nhắn đã được thu hồi</span>
                    ) : m.messageType === 'IMAGE' ? (
                      <img
                        src={m.content}
                        alt="attachment"
                        className="msg-image-content"
                      />
                    ) : m.messageType === 'FILE' ? (
                      <a
                        href={m.content}
                        target="_blank"
                        rel="noreferrer"
                        className="msg-file-content"
                      >
                        📎 Tệp đính kèm
                      </a>
                    ) : (
                      <span className="msg-text-content">{m.content}</span>
                    )}

                    {/* Inline time & status stamp */}
                    <span className="msg-inline-meta">
                      <span className="msg-time-stamp">{timeDisplay}</span>
                      {mine && !m.deleted && (
                        <span className="msg-status-icon">
                          <DoubleCheckIcon
                            size={14}
                            color={m.deliveryStatus === 'SEEN' ? '#60a5fa' : 'rgba(255,255,255,0.7)'}
                          />
                        </span>
                      )}
                    </span>
                  </div>

                  {/* Actions hover */}
                  {!m.deleted && (
                    <div className="msg-actions-hover">
                      <span onClick={() => setReplyTo(m)}>Trả lời</span>
                      {mine && <span onClick={() => handleRecall(m.messageId)}>Thu hồi</span>}
                    </div>
                  )}
                </div>
              </div>

            )
          })}
          <div ref={bottomRef} />
        </div>

        {/* Typing indicator */}
        {Object.keys(typingUsers).length > 0 && (
          <div className="typing-indicator">
            {Object.values(typingUsers).join(', ')} đang nhập...
          </div>
        )}

        {/* Reply preview */}
        {replyTo && (
          <div className="reply-preview-bar">
            <span>
              Đang trả lời:{' '}
              {replyTo.deleted
                ? 'tin nhắn đã thu hồi'
                : (replyTo.content || '').slice(0, 50)}
            </span>
            <button className="icon-btn" onClick={() => setReplyTo(null)}>
              ✕
            </button>
          </div>
        )}

        {/* Emoji picker popup */}
        {showEmojiPicker && (
          <div className="emoji-picker-popup">
            {quickEmojis.map((emoji) => (
              <button
                key={emoji}
                type="button"
                className="emoji-btn"
                onClick={() => {
                  setText((prev) => prev + emoji)
                  setShowEmojiPicker(false)
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        {/* Bottom Chat Input Bar */}
        <div className="chat-input-bar">
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileSelected}
          />

          <button
            type="button"
            className="input-tool-btn"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            title="Đính kèm tệp/ảnh"
          >
            <PaperclipIcon size={20} color="#8da2b5" />
          </button>

          <button
            type="button"
            className="input-tool-btn"
            onClick={() => setShowEmojiPicker((v) => !v)}
            title="Biểu tượng cảm xúc"
          >
            <EmojiIcon size={20} color="#8da2b5" />
          </button>

          <div className="chat-input-pill">
            <input
              type="text"
              placeholder="Nhập tin nhắn..."
              value={text}
              onChange={(e) => handleTyping(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
          </div>

          <button
            type="button"
            className="send-action-btn"
            onClick={handleSend}
            disabled={!text.trim()}
            title="Gửi"
          >
            <SendPaperPlane size={18} />
          </button>
        </div>
      </div>

      {/* Right Column: Real Contact Info Panel */}
      {showInfoPanel && (
        <ContactInfoPanel
          conversationInfo={conversationInfo}
          otherUserId={otherUserId}
          images={sharedImages}
          onClose={() => setShowInfoPanel(false)}
        />
      )}
    </div>
  )
}
