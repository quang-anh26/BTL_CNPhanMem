package com.example.messaging.repository;

import com.example.messaging.entity.Conversation;
import com.example.messaging.entity.enums.ConversationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    @Query("SELECT c FROM Conversation c " +
           "JOIN c.members m1 " +
           "JOIN c.members m2 " +
           "WHERE c.type = :type AND m1.user.userId = :userA AND m2.user.userId = :userB")
    Optional<Conversation> findPrivateConversationBetween(
            @Param("type") ConversationType type,
            @Param("userA") Long userA,
            @Param("userB") Long userB);

    @Query("SELECT DISTINCT c FROM Conversation c JOIN c.members m WHERE m.user.userId = :userId " +
           "ORDER BY c.createdAt DESC")
    List<Conversation> findAllByMemberUserId(@Param("userId") Long userId);

    @Query("SELECT DISTINCT c FROM Conversation c JOIN c.members m WHERE m.user.userId = :userId " +
           "AND (m.archived = false OR m.archived IS NULL) ORDER BY c.createdAt DESC")
    List<Conversation> findActiveByMemberUserId(@Param("userId") Long userId);

    @Query("SELECT DISTINCT c FROM Conversation c JOIN c.members m WHERE m.user.userId = :userId " +
           "AND m.archived = true ORDER BY c.createdAt DESC")
    List<Conversation> findArchivedByMemberUserId(@Param("userId") Long userId);
}
