package com.example.messaging.repository;

import com.example.messaging.entity.Block;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BlockRepository extends JpaRepository<Block, Long> {

    boolean existsByBlockerUserIdAndBlockedUserId(Long blockerId, Long blockedId);

    Optional<Block> findByBlockerUserIdAndBlockedUserId(Long blockerId, Long blockedId);

    void deleteByBlockerUserIdAndBlockedUserId(Long blockerId, Long blockedId);
}
