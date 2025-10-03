package com.gaurav.chat_app_backend.payload;

import com.gaurav.chat_app_backend.entities.Role;

public record RoomMemberResponse(
        String username,
        String email,
        String avatarUrl,
        boolean isAvatarSet,
        Role role
) {}

