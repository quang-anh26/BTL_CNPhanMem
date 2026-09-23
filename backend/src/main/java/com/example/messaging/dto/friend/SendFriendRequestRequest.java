package com.example.messaging.dto.friend;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SendFriendRequestRequest {
    @NotNull
    private Long receiverId;
}
