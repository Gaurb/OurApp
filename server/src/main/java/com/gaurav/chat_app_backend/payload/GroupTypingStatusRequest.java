package com.gaurav.chat_app_backend.payload;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GroupTypingStatusRequest {
    @NotBlank(message = "Sender is required")
    private String sender;
    
    @NotBlank(message = "Room name is required")
    private String roomName;
    
    private Boolean isTyping;
}

