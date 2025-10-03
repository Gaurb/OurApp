package com.gaurav.chat_app_backend.payload;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

public record AddMembersRequest(
        @NotBlank(message = "Room name is required")
        String roomName,
        
        @NotEmpty(message = "At least one member username is required")
        List<String> usernames
) {}

