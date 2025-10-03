package com.gaurav.chat_app_backend.payload;

import jakarta.validation.constraints.NotBlank;

public record RemoveMemberRequest(
        @NotBlank(message = "Room name is required")
        String roomName,
        
        @NotBlank(message = "Username is required")
        String username
) {}

