package com.gaurav.chat_app_backend.payload;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TypingStatusRequest {
    @NotNull(message = "Sender cannot be null")
    private String sender;
    
    @NotNull(message = "Receiver cannot be null")
    private String receiver;
    
    @NotNull(message = "Typing status cannot be null")
    private Boolean isTyping;
    
    private Long timestamp;
}
