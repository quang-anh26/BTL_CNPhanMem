package com.example.messaging.dto.chat;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
public class ConversationResponse {
    private Long conversationId;
    private String type; // PRIVATE / GROUP
    private String name;       // group name, or the other user's display name for PRIVATE
    private String avatar;     // group avatar, or the other user's avatar for PRIVATE
    private Long otherUserId;
    private String otherUserUsername;
    private String lastMessage;
    private LocalDateTime lastMessageAt;
    private long unreadCount;
    private boolean otherUserOnline; // only meaningful for PRIVATE
    private LocalDateTime otherUserLastSeenAt;
}
