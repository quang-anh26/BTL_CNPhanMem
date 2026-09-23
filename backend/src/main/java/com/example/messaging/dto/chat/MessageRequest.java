package com.example.messaging.dto.chat;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class MessageRequest {
    @NotNull
    private Long conversationId;

    private String content;          // text content (may be null/empty for pure attachment messages)
    private String messageType;      // TEXT, IMAGE, FILE
    private Long replyToMessageId;   // optional - Reply feature
}
