package com.example.messaging.dto.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class UserProfileResponse {
    private Long userId;
    private String username;
    private String displayName;
    private String avatar;
    private String bio;
    private boolean online;
    private String status; // ACTIVE / LOCKED
}
