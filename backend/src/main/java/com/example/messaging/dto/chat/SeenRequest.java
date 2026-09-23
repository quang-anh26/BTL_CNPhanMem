package com.example.messaging.dto.chat;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SeenRequest {
    @NotNull
    private Long conversationId;
}
