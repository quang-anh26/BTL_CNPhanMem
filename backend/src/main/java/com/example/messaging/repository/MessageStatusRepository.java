package com.example.messaging.repository;

import com.example.messaging.entity.MessageStatus;
import com.example.messaging.entity.enums.MessageDeliveryStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MessageStatusRepository extends JpaRepository<MessageStatus, Long> {

    Optional<MessageStatus> findByMessageMessageIdAndUserUserId(Long messageId, Long userId);

    List<MessageStatus> findByMessageMessageId(Long messageId);

    long countByMessageMessageIdAndStatus(Long messageId, MessageDeliveryStatus status);

    @org.springframework.data.jpa.repository.Query(
        "SELECT COUNT(ms) FROM MessageStatus ms WHERE ms.message.conversation.conversationId = :conversationId " +
        "AND ms.user.userId = :userId AND ms.status <> com.example.messaging.entity.enums.MessageDeliveryStatus.SEEN")
    long countUnseenInConversationForUser(@org.springframework.data.repository.query.Param("conversationId") Long conversationId,
                                           @org.springframework.data.repository.query.Param("userId") Long userId);
}
