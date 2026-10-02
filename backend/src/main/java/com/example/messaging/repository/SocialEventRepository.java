package com.example.messaging.repository;

import com.example.messaging.entity.SocialEvent;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SocialEventRepository extends JpaRepository<SocialEvent, Long> {
    @EntityGraph(attributePaths = {"organizer", "participants", "participants.user"})
    List<SocialEvent> findByCancelledFalseOrderByStartsAtAsc();
}
