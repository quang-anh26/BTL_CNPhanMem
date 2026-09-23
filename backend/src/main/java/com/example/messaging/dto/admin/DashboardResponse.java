package com.example.messaging.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class DashboardResponse {
    private long totalUsers;
    private long onlineUsers;
    private long lockedUsers;
    private long messagesToday;
}
