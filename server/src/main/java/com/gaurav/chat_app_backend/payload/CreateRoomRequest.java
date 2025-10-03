package com.gaurav.chat_app_backend.payload;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateRoomRequest(
        @NotBlank(message = "Room name is required")
        @Size(min = 3, max = 50, message = "Room name must be between 3 and 50 characters")
        String roomName,
        
        List<String> memberUsernames
) {
}