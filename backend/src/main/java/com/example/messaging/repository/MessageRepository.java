package com.example.messaging.repository;

import com.example.messaging.entity.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MessageRepository extends JpaRepository<Message, Long> {

    // Lazy-load history, 20 messages per page, newest first (see plan section 3 & 7)
    Page<Message> findByConversationConversationIdOrderByCreatedAtDesc(Long conversationId, Pageable pageable);

    long countByConversationConversationId(Long conversationId);
}
