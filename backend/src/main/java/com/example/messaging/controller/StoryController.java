package com.example.messaging.controller;

import com.example.messaging.dto.feed.CreateStoryRequest;
import com.example.messaging.dto.feed.StoryResponse;
import com.example.messaging.security.CurrentUser;
import com.example.messaging.service.FileStorageService;
import com.example.messaging.service.StoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.example.messaging.exception.ApiException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/stories")
@RequiredArgsConstructor
public class StoryController {

    private final StoryService storyService;
    private final FileStorageService fileStorageService;

    @GetMapping
    public ResponseEntity<List<StoryResponse>> list() {
        return ResponseEntity.ok(storyService.list());
    }

    @PostMapping
    public ResponseEntity<StoryResponse> create(@CurrentUser Long userId,
                                                 @Valid @RequestBody CreateStoryRequest request) {
        return ResponseEntity.ok(storyService.create(userId, request));
    }

    @DeleteMapping("/{storyId}")
    public ResponseEntity<Void> delete(@CurrentUser Long userId, @PathVariable Long storyId) {
        storyService.delete(userId, storyId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping(value = "/upload", consumes = "multipart/form-data")
    public ResponseEntity<Map<String, String>> upload(@RequestParam("file") MultipartFile file) {
        String contentType = file.getContentType();
        if (contentType == null || (!contentType.startsWith("image/") && !contentType.startsWith("video/"))) {
            throw ApiException.badRequest("Chỉ hỗ trợ tải ảnh hoặc video lên tin");
        }

        String mediaType = contentType.startsWith("video/") ? "VIDEO" : "IMAGE";
        return ResponseEntity.ok(Map.of("url", fileStorageService.store(file), "mediaType", mediaType));
    }
}
