import React from 'react'
import { Outlet, useParams } from 'react-router-dom'
import NavRail from '../components/NavRail'
import Sidebar from '../components/Sidebar'
import CallOverlay from '../components/CallOverlay'
import { useSocket } from '../context/SocketContext'

export default function MainLayout() {
  const { conversationId } = useParams()
  const { callRequest, clearCallRequest } = useSocket()
  return (
    <div className="app-shell">
      <NavRail />
      <Sidebar activeConversationId={conversationId} />
      <Outlet />
      <CallOverlay
        conversationInfo={callRequest}
        visible={Boolean(callRequest)}
        onClose={clearCallRequest}
      />
    </div>
  )
}
