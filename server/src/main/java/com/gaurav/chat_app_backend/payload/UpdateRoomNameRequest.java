package com.gaurav.chat_app_backend.payload;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateRoomNameRequest(
        @NotBlank(message = "Current room name is required")
        String currentRoomName,
        
        @NotBlank(message = "New room name is required")
        @Size(min = 3, max = 50, message = "Room name must be between 3 and 50 characters")
        String newRoomName
) {}

