package com.example.messaging.repository;

import com.example.messaging.entity.SocialPost;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SocialPostRepository extends JpaRepository<SocialPost, Long> {
}
