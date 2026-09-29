package com.example.messaging.dto.feed;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateStoryRequest {
    @Size(max = 500)
    private String content;

    @Size(max = 1000)
    private String mediaUrl;

    @Size(max = 10)
    private String mediaType;
}