package com.example.messaging.dto.event;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class EventAttendeeResponse {
    Long userId;
    String name;
    String avatar;
    String status;
}
