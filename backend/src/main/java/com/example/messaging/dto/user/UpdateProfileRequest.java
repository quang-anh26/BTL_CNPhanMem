package com.example.messaging.dto.user;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String displayName;
    private String avatar;
    private String bio;
}
