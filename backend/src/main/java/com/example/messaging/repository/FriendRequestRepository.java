package com.example.messaging.repository;

import com.example.messaging.entity.FriendRequest;
import com.example.messaging.entity.enums.FriendRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FriendRequestRepository extends JpaRepository<FriendRequest, Long> {

    List<FriendRequest> findByReceiverUserIdAndStatus(Long receiverId, FriendRequestStatus status);

    List<FriendRequest> findBySenderUserIdAndStatus(Long senderId, FriendRequestStatus status);

    Optional<FriendRequest> findBySenderUserIdAndReceiverUserIdAndStatus(
            Long senderId, Long receiverId, FriendRequestStatus status);

    boolean existsBySenderUserIdAndReceiverUserIdAndStatus(
            Long senderId, Long receiverId, FriendRequestStatus status);
}
