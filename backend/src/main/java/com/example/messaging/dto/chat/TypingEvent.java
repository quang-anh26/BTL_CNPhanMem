package com.example.messaging.dto.chat;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TypingEvent {
    private Long conversationId;
    private Long userId;
    private String username;
    private boolean typing;
}
