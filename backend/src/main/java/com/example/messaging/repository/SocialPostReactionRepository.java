package com.example.messaging.repository;

import com.example.messaging.entity.SocialPostReaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SocialPostReactionRepository extends JpaRepository<SocialPostReaction, Long> {
    Optional<SocialPostReaction> findByPostPostIdAndUserUserId(Long postId, Long userId);
    long countByPostPostId(Long postId);
}
