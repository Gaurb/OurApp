package com.gaurav.chat_app_backend.payload;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TypingStatusResponse {
    private String sender;
    private String receiver;
    private Boolean isTyping;
    private Long timestamp;
    
    public TypingStatusResponse(String sender, String receiver, Boolean isTyping) {
        this.sender = sender;
        this.receiver = receiver;
        this.isTyping = isTyping;
        this.timestamp = System.currentTimeMillis();
    }
}
