package com.gaurav.chat_app_backend.entities;

import org.springframework.data.mongodb.core.mapping.DBRef;

import lombok.Data;

@Data
public class RoomMember {
    private String username;  // Store username for easy querying
    @DBRef
    private User user;
    private Role role;
}
