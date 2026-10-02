package com.example.messaging.dto.event;

import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;
import java.util.List;

@Value
@Builder
public class EventResponse {
    Long eventId;
    Long organizerId;
    String organizerName;
    String organizerAvatar;
    String title;
    String imageUrl;
    LocalDateTime startsAt;
    String location;
    String description;
    String privacy;
    LocalDateTime createdAt;
    long goingCount;
    long interestedCount;
    String viewerStatus;
    List<EventAttendeeResponse> attendees;
}
