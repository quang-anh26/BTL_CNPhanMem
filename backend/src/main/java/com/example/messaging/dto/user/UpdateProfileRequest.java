package com.example.messaging.dto.user;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String displayName;
    private String avatar;
    private String coverImage;
    private String bio;
    private String education;
    private String location;
    private String relationshipStatus;
    private java.time.LocalDate birthDate;
}
