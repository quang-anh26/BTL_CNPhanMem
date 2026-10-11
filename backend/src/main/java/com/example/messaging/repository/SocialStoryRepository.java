package com.example.messaging.repository;

import com.example.messaging.entity.SocialStory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface SocialStoryRepository extends JpaRepository<SocialStory, Long> {
    List<SocialStory> findByExpiresAtAfterOrderByCreatedAtDesc(LocalDateTime now);
}