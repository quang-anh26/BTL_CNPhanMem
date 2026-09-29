import React from 'react'
import { Outlet, useLocation, useParams } from 'react-router-dom'
import NavRail from '../components/NavRail'
import Sidebar from '../components/Sidebar'
import CallOverlay from '../components/CallOverlay'
import { useSocket } from '../context/SocketContext'

export default function MainLayout() {
  const { conversationId } = useParams()
  const location = useLocation()
  const { callRequest, clearCallRequest } = useSocket()
  const isFeedPage = location.pathname.startsWith('/feed')
  const shellClass = isFeedPage ? 'feed-shell' : 'nav-overlay-shell'
  return (
    <div className={`app-shell ${shellClass}`}>
      <NavRail />
      {!isFeedPage && <Sidebar activeConversationId={conversationId} />}
      <Outlet />
      <CallOverlay
        conversationInfo={callRequest}
        visible={Boolean(callRequest)}
        onClose={clearCallRequest}
      />
    </div>
  )
}
