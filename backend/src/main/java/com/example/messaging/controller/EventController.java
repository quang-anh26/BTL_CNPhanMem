package com.example.messaging.controller;

import com.example.messaging.dto.event.EventAttendanceRequest;
import com.example.messaging.dto.event.EventResponse;
import com.example.messaging.dto.event.EventUpsertRequest;
import com.example.messaging.exception.ApiException;
import com.example.messaging.security.CurrentUser;
import com.example.messaging.service.EventService;
import com.example.messaging.service.FileStorageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {
    private final EventService eventService;
    private final FileStorageService fileStorageService;

    @GetMapping
    public ResponseEntity<List<EventResponse>> list(@CurrentUser Long userId,
                                                     @RequestParam(defaultValue = "ALL") String filter) {
        return ResponseEntity.ok(eventService.list(userId, filter));
    }

    @GetMapping("/{eventId}")
    public ResponseEntity<EventResponse> get(@CurrentUser Long userId, @PathVariable Long eventId) {
        return ResponseEntity.ok(eventService.get(eventId, userId));
    }

    @PostMapping
    public ResponseEntity<EventResponse> create(@CurrentUser Long userId,
                                                 @Valid @RequestBody EventUpsertRequest request) {
        return ResponseEntity.ok(eventService.create(userId, request));
    }

    @PutMapping("/{eventId}")
    public ResponseEntity<EventResponse> update(@CurrentUser Long userId, @PathVariable Long eventId,
                                                 @Valid @RequestBody EventUpsertRequest request) {
        return ResponseEntity.ok(eventService.update(eventId, userId, request));
    }

    @DeleteMapping("/{eventId}")
    public ResponseEntity<Void> cancel(@CurrentUser Long userId, @PathVariable Long eventId) {
        eventService.cancel(eventId, userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{eventId}/attendance")
    public ResponseEntity<EventResponse> attendance(@CurrentUser Long userId, @PathVariable Long eventId,
                                                     @Valid @RequestBody EventAttendanceRequest request) {
        return ResponseEntity.ok(eventService.setAttendance(eventId, userId, request));
    }

    @PostMapping(value = "/upload", consumes = "multipart/form-data")
    public ResponseEntity<Map<String, String>> uploadImage(@RequestParam("file") MultipartFile file) {
        if (file.getContentType() == null || !file.getContentType().startsWith("image/")) {
            throw ApiException.badRequest("Ảnh sự kiện không hợp lệ");
        }
        return ResponseEntity.ok(Map.of("url", fileStorageService.store(file)));
    }
}
