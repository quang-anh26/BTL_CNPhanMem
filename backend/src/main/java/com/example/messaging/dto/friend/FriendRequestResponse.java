package com.example.messaging.dto.friend;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
public class FriendRequestResponse {
    private Long id;
    private Long senderId;
    private String senderUsername;
    private String senderDisplayName;
    private String senderAvatar;
    private Long receiverId;
    private String status;
    private LocalDateTime createdAt;
}
