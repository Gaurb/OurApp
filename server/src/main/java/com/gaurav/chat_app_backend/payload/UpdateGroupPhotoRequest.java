package com.gaurav.chat_app_backend.payload;

import jakarta.validation.constraints.NotBlank;

public record UpdateGroupPhotoRequest(
        @NotBlank(message = "Room name is required")
        String roomName,
        
        @NotBlank(message = "Photo URL is required")
        String photoUrl
) {}

