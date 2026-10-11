package com.example.messaging.dto.feed;

import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;
import java.util.List;

@Value
@Builder
public class FeedPostResponse {
    Long postId;
    Long authorId;
    String authorName;
    String authorAvatar;
    String content;
    String imageUrl;
    String mediaType;
    LocalDateTime createdAt;
    long likeCount;
    boolean likedByViewer;
    String viewerReaction;
    List<FeedCommentResponse> comments;
    long shareCount;
    SharedPostResponse sharedPost;
}
