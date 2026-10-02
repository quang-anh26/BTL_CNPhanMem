package com.example.messaging.dto.feed;

import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;

@Value
@Builder
public class SharedPostResponse {
    Long postId;
    Long authorId;
    String authorName;
    String authorAvatar;
    String content;
    String imageUrl;
    String mediaType;
    LocalDateTime createdAt;
}
