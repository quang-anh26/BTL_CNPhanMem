package com.example.messaging.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
public class AdminUserView {
    private Long userId;
    private String username;
    private String displayName;
    private String status;
    private String role;
    private boolean online;
    private LocalDateTime createdAt;
}
