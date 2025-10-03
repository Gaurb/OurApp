package com.gaurav.chat_app_backend.payload;

import java.time.LocalDateTime;
import java.util.List;

public record RoomResponse(
        String id,
        String roomName,
        String groupPhotoUrl,
        boolean isGroupPhotoSet,
        List<RoomMemberResponse> members,
        String createdBy,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}

