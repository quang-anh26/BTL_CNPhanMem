package com.example.messaging.controller;

import com.example.messaging.dto.feed.CreateCommentRequest;
import com.example.messaging.dto.feed.CreatePostRequest;
import com.example.messaging.dto.feed.FeedPostResponse;
import com.example.messaging.security.CurrentUser;
import com.example.messaging.service.FeedService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/feed")
@RequiredArgsConstructor
public class FeedController {

    private final FeedService feedService;

    @GetMapping
    public ResponseEntity<List<FeedPostResponse>> list(@CurrentUser Long userId) {
        return ResponseEntity.ok(feedService.list(userId));
    }

    @PostMapping
    public ResponseEntity<FeedPostResponse> create(@CurrentUser Long userId,
                                                    @Valid @RequestBody CreatePostRequest request) {
        return ResponseEntity.ok(feedService.create(userId, request));
    }

    @PostMapping("/{postId}/like")
    public ResponseEntity<FeedPostResponse> like(@CurrentUser Long userId, @PathVariable Long postId) {
        return ResponseEntity.ok(feedService.toggleLike(postId, userId));
    }

    @PostMapping("/{postId}/reaction")
    public ResponseEntity<FeedPostResponse> react(@CurrentUser Long userId,
                                                   @PathVariable Long postId,
                                                   @RequestParam(defaultValue = "LIKE") String reactionType) {
        return ResponseEntity.ok(feedService.setReaction(postId, userId, reactionType));
    }

    @PostMapping("/{postId}/comments")
    public ResponseEntity<FeedPostResponse> comment(@CurrentUser Long userId,
                                                     @PathVariable Long postId,
                                                     @Valid @RequestBody CreateCommentRequest request) {
        return ResponseEntity.ok(feedService.addComment(postId, userId, request));
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<Void> delete(@CurrentUser Long userId, @PathVariable Long postId) {
        feedService.delete(postId, userId);
        return ResponseEntity.noContent().build();
    }
}
