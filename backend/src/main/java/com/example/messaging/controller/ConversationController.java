package com.example.messaging.controller;

import com.example.messaging.dto.chat.ConversationResponse;
import com.example.messaging.dto.chat.CreateGroupRequest;
import com.example.messaging.entity.Conversation;
import com.example.messaging.security.CurrentUser;
import com.example.messaging.service.ConversationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/conversations")
@RequiredArgsConstructor
public class ConversationController {

    private final ConversationService conversationService;

    @GetMapping
    public ResponseEntity<List<ConversationResponse>> list(@CurrentUser Long userId) {
        return ResponseEntity.ok(conversationService.listForUser(userId));
    }

    @GetMapping("/archived")
    public ResponseEntity<List<ConversationResponse>> archived(@CurrentUser Long userId) {
        return ResponseEntity.ok(conversationService.listArchivedForUser(userId));
    }

    @PostMapping("/{conversationId}/archive")
    public ResponseEntity<Void> archive(@CurrentUser Long userId,
                                        @PathVariable Long conversationId,
                                        @RequestParam(defaultValue = "true") boolean archived) {
        conversationService.setArchived(conversationId, userId, archived);
        return ResponseEntity.noContent().build();
    }

    /** Chat 1-1: get-or-create a PRIVATE conversation with another user (after friend accepted). */
    @PostMapping("/private/{otherUserId}")
    public ResponseEntity<Map<String, Long>> getOrCreatePrivate(@CurrentUser Long userId,
                                                                  @PathVariable Long otherUserId) {
        Conversation c = conversationService.getOrCreatePrivateConversation(userId, otherUserId);
        return ResponseEntity.ok(Map.of("conversationId", c.getConversationId()));
    }

    @PostMapping("/group")
    public ResponseEntity<Map<String, Long>> createGroup(@CurrentUser Long userId,
                                                           @Valid @RequestBody CreateGroupRequest request) {
        Conversation c = conversationService.createGroup(userId, request);
        return ResponseEntity.ok(Map.of("conversationId", c.getConversationId()));
    }

    @PostMapping("/{conversationId}/members/{memberId}")
    public ResponseEntity<Void> addMember(@CurrentUser Long userId, @PathVariable Long conversationId,
                                           @PathVariable Long memberId) {
        conversationService.addMember(conversationId, userId, memberId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{conversationId}/members/{memberId}")
    public ResponseEntity<Void> removeMember(@CurrentUser Long userId, @PathVariable Long conversationId,
                                              @PathVariable Long memberId) {
        conversationService.removeMember(conversationId, userId, memberId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{conversationId}/leave")
    public ResponseEntity<Void> leave(@CurrentUser Long userId, @PathVariable Long conversationId) {
        conversationService.leaveGroup(conversationId, userId);
        return ResponseEntity.noContent().build();
    }
}
