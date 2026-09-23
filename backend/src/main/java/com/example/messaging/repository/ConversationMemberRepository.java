package com.example.messaging.repository;

import com.example.messaging.entity.ConversationMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ConversationMemberRepository extends JpaRepository<ConversationMember, Long> {

    List<ConversationMember> findByConversationConversationId(Long conversationId);

    Optional<ConversationMember> findByConversationConversationIdAndUserUserId(Long conversationId, Long userId);

    boolean existsByConversationConversationIdAndUserUserId(Long conversationId, Long userId);

    void deleteByConversationConversationIdAndUserUserId(Long conversationId, Long userId);
}
