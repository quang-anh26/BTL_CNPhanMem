package com.example.messaging.repository;

import com.example.messaging.entity.SocialPostComment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SocialPostCommentRepository extends JpaRepository<SocialPostComment, Long> {
    List<SocialPostComment> findByPostPostIdOrderByCreatedAtAsc(Long postId);
}
