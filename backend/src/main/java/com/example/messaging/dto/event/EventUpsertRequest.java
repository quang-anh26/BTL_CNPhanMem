package com.example.messaging.dto.event;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class EventUpsertRequest {
    @NotBlank
    @Size(max = 120)
    private String title;

    @Size(max = 1000)
    private String imageUrl;

    @NotNull
    private LocalDateTime startsAt;

    @NotBlank
    @Size(max = 180)
    private String location;

    @Size(max = 5000)
    private String description;

    @NotBlank
    private String privacy;
}
