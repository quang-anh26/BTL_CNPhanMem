package com.example.messaging.dto.feed;

import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;

@Value
@Builder
public class StoryResponse {
    Long storyId;
    Long authorId;
    String authorName;
    String authorAvatar;
    String content;
    String mediaUrl;
    String mediaType;
    LocalDateTime createdAt;
    LocalDateTime expiresAt;
}