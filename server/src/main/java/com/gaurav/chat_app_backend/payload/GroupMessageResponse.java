package com.gaurav.chat_app_backend.payload;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class GroupMessageResponse {
    private String id;
    private String sender;
    private String roomName;
    private String content;
    private LocalDateTime timestamp;
}

