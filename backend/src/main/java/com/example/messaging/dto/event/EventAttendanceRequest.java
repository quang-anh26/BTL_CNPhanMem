package com.example.messaging.dto.event;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class EventAttendanceRequest {
    @NotBlank
    private String status;
}
