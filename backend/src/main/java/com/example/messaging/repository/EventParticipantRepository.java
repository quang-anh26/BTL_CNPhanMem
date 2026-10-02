package com.example.messaging.repository;

import com.example.messaging.entity.EventParticipant;
import com.example.messaging.entity.enums.EventAttendanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface EventParticipantRepository extends JpaRepository<EventParticipant, Long> {
    @Query("select p from EventParticipant p join fetch p.user where p.event.eventId = :eventId order by p.createdAt asc")
    List<EventParticipant> findAttendees(@Param("eventId") Long eventId);

    Optional<EventParticipant> findByEventEventIdAndUserUserId(Long eventId, Long userId);

    long countByEventEventIdAndStatus(Long eventId, EventAttendanceStatus status);
}
