package com.example.messaging.service;

import com.example.messaging.dto.chat.ConversationResponse;
import com.example.messaging.dto.chat.CreateGroupRequest;
import com.example.messaging.entity.Conversation;
import com.example.messaging.entity.ConversationMember;
import com.example.messaging.entity.Message;
import com.example.messaging.entity.User;
import com.example.messaging.entity.enums.ConversationType;
import com.example.messaging.entity.enums.MemberRole;
import com.example.messaging.entity.enums.MessageDeliveryStatus;
import com.example.messaging.exception.ApiException;
import com.example.messaging.repository.ConversationMemberRepository;
import com.example.messaging.repository.ConversationRepository;
import com.example.messaging.repository.MessageRepository;
import com.example.messaging.repository.MessageStatusRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ConversationService {

    private final ConversationRepository conversationRepository;
    private final ConversationMemberRepository memberRepository;
    private final MessageRepository messageRepository;
    private final MessageStatusRepository messageStatusRepository;
    private final UserService userService;

    /**
     * Chat 1-1: reuse existing PRIVATE conversation between the two users if one exists,
     * otherwise create it (plan section 7, step 2: "có thể bắt đầu chat" after friend request accepted).
     */
    @Transactional
    public Conversation getOrCreatePrivateConversation(Long userAId, Long userBId) {
        Optional<Conversation> existing = conversationRepository
                .findPrivateConversationBetween(ConversationType.PRIVATE, userAId, userBId);
        if (existing.isPresent()) {
            return existing.get();
        }

        User userA = userService.getByIdOrThrow(userAId);
        User userB = userService.getByIdOrThrow(userBId);

        Conversation conversation = Conversation.builder()
                .type(ConversationType.PRIVATE)
                .build();
        conversation = conversationRepository.save(conversation);

        memberRepository.save(ConversationMember.builder()
                .conversation(conversation).user(userA).role(MemberRole.MEMBER).build());
        memberRepository.save(ConversationMember.builder()
                .conversation(conversation).user(userB).role(MemberRole.MEMBER).build());

        return conversation;
    }

    @Transactional
    public Conversation createGroup(Long creatorId, CreateGroupRequest request) {
        User creator = userService.getByIdOrThrow(creatorId);

        Conversation conversation = Conversation.builder()
                .type(ConversationType.GROUP)
                .name(request.getName())
                .avatar(request.getAvatar())
                .build();
        conversation = conversationRepository.save(conversation);

        memberRepository.save(ConversationMember.builder()
                .conversation(conversation).user(creator).role(MemberRole.ADMIN).build());

        for (Long memberId : request.getMemberIds()) {
            if (memberId.equals(creatorId)) continue;
            User member = userService.getByIdOrThrow(memberId);
            memberRepository.save(ConversationMember.builder()
                    .conversation(conversation).user(member).role(MemberRole.MEMBER).build());
        }

        return conversation;
    }

    @Transactional
    public void addMember(Long conversationId, Long requesterId, Long newMemberId) {
        requireGroupAdmin(conversationId, requesterId);
        Conversation conversation = getByIdOrThrow(conversationId);
        User newMember = userService.getByIdOrThrow(newMemberId);

        if (memberRepository.existsByConversationConversationIdAndUserUserId(conversationId, newMemberId)) {
            throw ApiException.conflict("Người dùng đã ở trong nhóm");
        }

        memberRepository.save(ConversationMember.builder()
                .conversation(conversation).user(newMember).role(MemberRole.MEMBER).build());
    }

    @Transactional
    public void removeMember(Long conversationId, Long requesterId, Long memberIdToRemove) {
        requireGroupAdmin(conversationId, requesterId);
        memberRepository.deleteByConversationConversationIdAndUserUserId(conversationId, memberIdToRemove);
    }

    @Transactional
    public void leaveGroup(Long conversationId, Long userId) {
        memberRepository.deleteByConversationConversationIdAndUserUserId(conversationId, userId);
    }

    private void requireGroupAdmin(Long conversationId, Long userId) {
        ConversationMember member = memberRepository
                .findByConversationConversationIdAndUserUserId(conversationId, userId)
                .orElseThrow(() -> ApiException.forbidden("Bạn không phải thành viên nhóm này"));
        if (member.getRole() != MemberRole.ADMIN) {
            throw ApiException.forbidden("Chỉ Admin nhóm mới có quyền này");
        }
    }

    public Conversation getByIdOrThrow(Long conversationId) {
        return conversationRepository.findById(conversationId)
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy cuộc trò chuyện"));
    }

    public void assertMember(Long conversationId, Long userId) {
        if (!memberRepository.existsByConversationConversationIdAndUserUserId(conversationId, userId)) {
            throw ApiException.forbidden("Bạn không thuộc cuộc trò chuyện này");
        }
    }

    /** List all conversations for the sidebar, newest activity first, with unread badge. */
    public List<ConversationResponse> listForUser(Long userId) {
        return conversationRepository.findAllByMemberUserId(userId).stream()
                .map(c -> toResponse(c, userId))
                .sorted((a, b) -> {
                    if (a.getLastMessageAt() == null) return 1;
                    if (b.getLastMessageAt() == null) return -1;
                    return b.getLastMessageAt().compareTo(a.getLastMessageAt());
                })
                .collect(Collectors.toList());
    }

    private ConversationResponse toResponse(Conversation conversation, Long viewerUserId) {
        String name = conversation.getName();
        String avatar = conversation.getAvatar();
        String otherUsername = null;
        boolean otherOnline = false;
        java.time.LocalDateTime otherLastSeenAt = null;

        if (conversation.getType() == ConversationType.PRIVATE) {
            Optional<ConversationMember> other = conversation.getMembers().stream()
                    .filter(m -> !m.getUser().getUserId().equals(viewerUserId))
                    .findFirst();
            if (other.isPresent()) {
                User otherUser = other.get().getUser();
                name = otherUser.getDisplayName();
                avatar = otherUser.getAvatar();
                otherUsername = otherUser.getUsername();
                otherOnline = otherUser.isOnline();
                otherLastSeenAt = otherUser.getLastSeenAt();
            }
        }

        var lastPage = messageRepository.findByConversationConversationIdOrderByCreatedAtDesc(
                conversation.getConversationId(), PageRequest.of(0, 1, Sort.unsorted()));
        Message last = lastPage.hasContent() ? lastPage.getContent().get(0) : null;

        long unread = messageStatusRepository.countUnseenInConversationForUser(
                conversation.getConversationId(), viewerUserId);

        return ConversationResponse.builder()
                .conversationId(conversation.getConversationId())
                .type(conversation.getType().name())
                .name(name)
                .avatar(avatar)
                .otherUserUsername(otherUsername)
                .lastMessage(last != null ? (last.isDeleted() ? "Tin nhắn đã được thu hồi" : last.getContent()) : null)
                .lastMessageAt(last != null ? last.getCreatedAt() : null)
                .unreadCount(unread)
                .otherUserOnline(otherOnline)
                .otherUserLastSeenAt(otherLastSeenAt)
                .build();
    }
}
