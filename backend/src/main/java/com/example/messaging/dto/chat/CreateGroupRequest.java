package com.example.messaging.dto.chat;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class CreateGroupRequest {
    @NotBlank
    private String name;
    private String avatar;

    @NotEmpty
    private List<Long> memberIds; // does not include the creator; creator is auto-added as ADMIN
}
